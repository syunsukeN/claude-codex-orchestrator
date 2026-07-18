# Claude Codex Orchestrator 仕様書

| 項目 | 内容 |
|---|---|
| 対象バージョン | 0.0.1 |
| 作成日 | 2026-07-18 |
| 実装状況 | Phase 1〜3 実装済み（単体テスト 143 件 / 統合テスト 3 件 全パス）。Phase 4〜5 は未実装 |
| 要件定義 | [CLAUDE.md](../CLAUDE.md) |

## 1. 概要

VSCode 内で動く個人用 AI オーケストレーション拡張機能。1 つのスレッド内で Codex CLI と Claude CLI を切り替えながら作業し、AI 切替時に文脈を自動で引き継ぐ。ターミナルを 2 つ開いて手動で行っていた連携を 1 画面で完結させる。

- 対象ユーザー: 開発者本人のみ（認証・権限管理・Marketplace 公開はスコープ外）
- 配布: `vsce package` による .vsix ローカルインストール
- ライセンス: UNLICENSED（全権利保留、`private: true`）

## 2. 技術スタック

| 層 | 技術 |
|---|---|
| 拡張機能ホスト | TypeScript + VSCode Extension API（engines.vscode ^1.90.0） |
| Webview UI | Svelte 5（runes モード）+ Vite |
| CLI 実行 | Node 標準 `child_process.spawn`（依存パッケージなし） |
| CLI 出力パース | 自前 JSONL パーサー（行バッファリング） |
| ビルド | esbuild（拡張ホスト → `dist/extension.js`, CJS）+ Vite（Webview → `dist/webview/main.js` / `main.css`） |
| テスト | Vitest + jsdom + @testing-library/svelte + sinon（単体）、@vscode/test-electron + mocha（統合） |

## 3. アーキテクチャ

```
┌─ VSCode ──────────────────────────────────────────────────────────┐
│  サイドバー                メインエディタ領域                        │
│  ┌──────────────┐        ┌─ Webview (Svelte) ─────────────┐       │
│  │ Projects      │ click  │ ChatFrame                      │       │
│  │ TreeView      │──────▶│  ├ AI切替トグル (Codex⇄Claude)  │       │
│  │ (workspace    │        │  ├ MessageList（ストリーミング） │       │
│  │  Folders)     │        │  └ 入力欄 + 送信ボタン           │       │
│  └──────────────┘        └───────────┬────────────────────┘       │
│                              postMessage ⇅ (型付きプロトコル)       │
│  ┌─ 拡張機能ホスト ─────────────────────────────────────────┐      │
│  │ chatPanel ── ChatSession { codexThreadId, claudeSessionId,│      │
│  │   │          running, activeRun, context: ThreadContext } │      │
│  │   ├ threadContext（文脈デルタ同期・純関数）                 │      │
│  │   ├ codexRunner ─ codexEventParser ─┐                    │      │
│  │   └ claudeRunner ─ claudeEventParser ┴ JsonlParser<T>     │      │
│  └───────┬──────────────────────────────────────────────────┘      │
└──────────┼────────────────────────────────────────────────────────┘
     spawn (cwd=プロジェクトパス)
  ┌────────┴────────┐
  │ codex exec --json│  claude -p --output-format stream-json ...
  └─────────────────┘
```

責務分離の原則:

- **parser**（codexEventParser / claudeEventParser）: 文字列チャンク → 型付きイベント配列。プロセス・表示の知識を持たない
- **runner**（codexRunner / claudeRunner): spawn のライフサイクル管理とイベント配送。JSON の知識はパーサーに委譲
- **chatPanel**: セッション状態の保有、イベントの横取り（sessionId・最終出力）、Webview への転送
- **chatState**（Webview）: イベント → 表示モデルの純関数リデューサ
- **MessageList**: props のみの表示専用コンポーネント

テスト容易性のため、拡張ホスト側は `vscode` モジュールと `child_process` に直接依存せず、構造的互換の DI 型（`UriLike` / `WebviewLike` / `WebviewPanelLike` / `SpawnLike` / `ChildProcessLike`）を介して注入する。実体は `extension.ts` だけが結線する。

## 4. ディレクトリ構成

```
src/
  extension/
    extension.ts          activate/deactivate（TreeView・コマンド登録、実依存の結線のみ）
    projects.ts           getProjects: workspaceFolders → Project[]（純関数・vscode非依存）
    projectTreeProvider.ts サイドバーの TreeDataProvider
    chatPanel.ts          Webviewパネル生成・メッセージハンドリング・ChatSession
    jsonlParser.ts        汎用 JsonlParser<T>（行バッファリング）
    codexEventParser.ts   parseCodexEventLine + CodexEventParser
    claudeEventParser.ts  parseClaudeEventLine + ClaudeEventParser
    codexRunner.ts        runCodex + DI型（SpawnLike等）
    claudeRunner.ts       runClaude
    threadContext.ts      文脈デルタ同期（buildPrompt/beginTurn/completeTurn 純関数）
  shared/                 拡張ホスト・Webview 共有の型定義
    messages.ts           postMessage プロトコル
    codexEvents.ts        CodexEvent discriminated union
    claudeEvents.ts       ClaudeEvent discriminated union
  webview/
    main.ts               Svelte mount + ready 通知
    vscodeApi.ts          acquireVsCodeApi ラッパー（非VSCode環境フォールバック付き）
    ChatFrame.svelte      状態オーナー（messages/running/currentAi、window message 購読）
    MessageList.svelte    表示専用
    chatState.ts          applyCodexEvent / applyClaudeEvent 純関数リデューサ
test/
  unit/                   Vitest（10ファイル・143件）。helpers/fakeChildProcess.ts を共用
  integration/            @vscode/test-electron + mocha（3件）
```

## 5. 機能仕様

### 5.1 プロジェクト一覧（Phase 1）

- `vscode.workspace.workspaceFolders` から `Project { id, name, path }` を取得（id = fsPath）
- アクティビティバーの独自コンテナ内にツリービュー（view id: `claudeCodexOrchestrator.projects`）で一覧表示
- `onDidChangeWorkspaceFolders` で自動リフレッシュ
- プロジェクトのクリック → コマンド `claudeCodexOrchestrator.openChat` → チャットパネルが開く

### 5.2 チャットパネル（Phase 1）

- viewType: `claudeCodexOrchestrator.chatPanel`、タイトル `Chat: <プロジェクト名>`
- `enableScripts: true` / `retainContextWhenHidden: true`
- HTML は nonce ベース CSP で `dist/webview/main.js` / `main.css` を読み込み。プロジェクト情報は `#app` の data 属性で埋め込み（HTML エスケープ済み)
- パネル dispose 時に実行中の CLI プロセスを kill

### 5.3 メッセージ送信と実行制御（Phase 2〜3）

- 入力欄のテキストを選択中 AI に送信。送信時に Webview がユーザーメッセージをローカルエコー表示
- 実行中（running）は入力欄・送信ボタンを disabled にし、ホスト側でも二重送信をガード（二重防御）
- 完了で `runCompleted`、失敗で `runFailed` が Webview に届き running 解除

### 5.4 CLI 起動仕様（実機確認済み: codex-cli 0.144.5 / claude 2.1.214）

| ケース | コマンド |
|---|---|
| Codex 新規 | `codex exec --json <prompt>` |
| Codex resume | `codex exec resume --json <threadId> <prompt>`（サブコマンド形式。`--resume` フラグではない） |
| Claude 新規 | `claude -p --output-format stream-json --include-partial-messages --verbose <prompt>` |
| Claude resume | 上記 + `--resume <sessionId>`（prompt の前に挿入） |

- cwd は選択中プロジェクトのパス。`shell: true` は使わない（プロンプトは引数としてそのまま渡し、シェルエスケープ不要）
- 権限系フラグ（`--dangerously-skip-permissions` 等）は付与しない

### 5.5 セッション管理と resume（Phase 3）

- `ChatSession` に `codexThreadId`（Codex の `thread.started` から取得）と `claudeSessionId`（Claude の `system/init` および `result` から取得）を独立保持
- 2 回目以降の送信は各 sessionId で resume し、AI ごとの会話コンテキストを CLI 側で継続
- 現状はメモリ保持のみ（永続化は Phase 5）

### 5.6 AI 切替と文脈引き継ぎ = 自動デルタ同期（Phase 3）

CLAUDE.md 当初案の「直前の最終出力を単発注入」に代わり、ユーザー合意のうえ**自動デルタ同期方式**を採用。

- `ThreadContext { turns: Turn[], seen: { codex, claude } }` をホスト側で保持。`Turn = { ai, userText, finalOutput }`
- 各 AI の `seen` は「そのAIが把握しているターン数」。送信時に未読分 `turns.slice(seen[ai])` をテンプレートで注入する:

```
【ここまでの経緯】
ユーザー→Codex: <userText>
Codex: <finalOutput（null なら「(応答なし)」）>
...（未読ターンぶん繰り返し）
【ユーザー入力】
<今回のユーザー入力>
```

- 未読ゼロ（同一 AI 連続送信など）なら注入せずユーザー入力をそのまま渡す
- 処理順序の契約: `buildPrompt` → `beginTurn`（seen を更新して新ターン push）→ spawn → 完了/失敗時 `completeTurn`（finalOutput 記録、失敗時は null）
- 最終出力の定義: Codex = 最後の `item.completed` `agent_message` の `item.text` / Claude = `result` の `result` フィールド
- 注入はホスト側のみで行い、**Webview にはユーザー入力だけを表示**する（注入文はユーザーに見せない）
- 切替時の即時同期はしない（切替してすぐ戻した場合の無駄な API 呼び出しを避けるため、次回送信時に遅延注入）

## 6. CLI イベント仕様とパース方針

パーサー共通方針: JSONL を行単位でパースし、**空行・不正 JSON・未知の type は null でスキップ**（deep validation はしない）。stdout チャンクが行の途中で切れるケースは `JsonlParser<T>` の行バッファが吸収し、ストリーム終端で `flush()` して未改行の最終行を取りこぼさない。

### 6.1 Codex（`codex exec --json`）

| イベント | 扱い |
|---|---|
| `thread.started {thread_id}` | codexThreadId 保存（表示なし） |
| `turn.started` | 無視 |
| `turn.completed {usage}` | 完了マーク表示 |
| `turn.failed {error.message}` | runner が onError に変換 → エラー表示 |
| `error {message}` | `Reconnecting... X/Y` 形式は非致命的として無視。それ以外は onError |
| `item.* command_execution` | コマンド + status + 出力を itemId で upsert 表示（ストリーミング更新） |
| `item.completed agent_message` | 最終回答として表示 + 引き継ぎ用に横取り |
| `item.completed file_change` | 変更ファイル一覧（path + kind）表示 |
| `item.completed error` | 非致命的警告として表示 |
| `reasoning` / `mcp_tool_call` / `web_search` / `todo_list` | 無視（表示しない） |

### 6.2 Claude（`claude -p --output-format stream-json --include-partial-messages --verbose`）

| イベント | 扱い |
|---|---|
| `system/init {session_id, model, tools}` | claudeSessionId 保存（表示なし） |
| `system/api_retry`・`system/plugin_install` | パーサーでスキップ |
| `stream_event content_block_delta text_delta` | ストリーミングテキストとして逐次追記表示 |
| `stream_event` その他（message_start/content_block_start/stop 等・input_json_delta） | パーサーでスキップ |
| `assistant` の `tool_use` ブロック | ツール名 + input 概要（JSON 100 文字切詰）を表示 |
| `assistant` の `text`・`thinking` ブロック | 表示しない（text は stream で表示済み、result がフォールバック） |
| `user`（tool_result） | パーサーでスキップ |
| `result {subtype, result, session_id, ...}` | sessionId・最終テキスト横取り。ストリーム表示済みなら重複排除（streaming フラグ解除のみ）、未ストリームなら result を表示。`subtype ≠ success`（error_max_turns 等）は警告表示（run 失敗にはしない） |

### 6.3 runner の終端規約（両 runner 共通）

- `close` ハンドラは **flush → dispatch → settle** の順
- exit code 0 → `onComplete` / 非 0 → `onError("<cli> exited with code N")` / spawn エラー（ENOENT 等）→ `onError`
- `settled` ガードにより終端コールバック（onComplete/onError）はどちらか 1 回のみ
- `kill()` は settled = true にしてから `child.kill()`（kill 後のコールバック発火を抑止）

## 7. Webview ⇄ ホスト メッセージプロトコル（`src/shared/messages.ts`）

```ts
// Webview → ホスト
type WebviewToHostMessage =
  | { type: 'ready' }
  | { type: 'sendMessage'; ai: 'codex' | 'claude'; text: string };

// ホスト → Webview
type HostToWebviewMessage =
  | { type: 'init'; project: { id: string; name: string; path: string } }
  | { type: 'codexEvent'; event: CodexEvent }
  | { type: 'claudeEvent'; event: ClaudeEvent }
  | { type: 'runCompleted' }
  | { type: 'runFailed'; message: string };
```

- `runStarted` は存在しない（Webview は送信時に楽観的に running = true とし、runCompleted / runFailed で必ず解除される）
- `init` は型定義済みだが現状未使用（プロジェクト情報は data 属性経由）

## 8. 表示モデル（`src/webview/chatState.ts`）

```ts
type ChatMessage =
  | { kind: 'user'; text }                                        // ローカルエコー
  | { kind: 'agent'; text; streaming? }                           // AI回答（Claude はストリーミング中 streaming: true）
  | { kind: 'command'; itemId; command; status; exitCode; output } // Codex コマンド実行（upsert）
  | { kind: 'fileChange'; changes }                               // Codex ファイル変更
  | { kind: 'error'; message }
  | { kind: 'turnCompleted'; usage }                              // Codex 完了マーク
  | { kind: 'toolUse'; toolUseId; name; inputSummary }            // Claude ツール使用
  | { kind: 'warning'; message };                                 // Claude subtype≠success 等
```

`applyCodexEvent` / `applyClaudeEvent` はイミュータブルな純関数。ChatFrame が `$state` の messages に再代入し、MessageList が描画する。主な data-testid: `message-list`, `message-user`, `message-agent`, `message-command`, `command-status`, `message-file-change`, `message-error`, `message-completed`, `message-tool-use`, `tool-use-name`, `tool-use-input`, `message-warning`, `loading-indicator`, `ai-toggle-codex`, `ai-toggle-claude`, `chat-input`, `send-button`。

## 9. エラーハンドリング方針

個人用のため最小限（CLAUDE.md 準拠）:

- CLI 異常終了・spawn 失敗は `runFailed` として Webview にエラー表示
- 失敗時も `completeTurn(ctx, ai, null)` で seen を進める（次回他 AI への注入では「(応答なし)」となる）
- stderr は蓄積のみ（表示しない）
- Claude の `subtype ≠ success` は「実行失敗」ではなく警告表示

## 10. テスト仕様

TDD（Red → Green → Refactor）で構築。実 CLI は一切叩かず、sinon + EventEmitter ベースの `FakeChildProcess`（`test/unit/helpers/`）でストリームを駆動する。

| ファイル | 件数 | 主な検証内容 |
|---|---|---|
| projects.test.ts | 4 | workspaceFolders → Project[] 変換 |
| codexEventParser.test.ts | 24 | 各イベント型パース、チャンク分割、flush、不正行スキップ |
| claudeEventParser.test.ts | 23 | 同上（stream-json）、無視対象イベントの null 判定 |
| codexRunner.test.ts | 12 | spawn 引数（新規/resume）、イベント順序、settle ガード、kill 抑止 |
| claudeRunner.test.ts | 10 | 同上 + result 素通し・subtype≠success で onError にならない |
| threadContext.test.ts | 9 | 注入文字列の完全一致、seen 更新、相互デルタ、イミュータブル性 |
| chatState.test.ts | 19 | 両 reducer の表示規則（upsert、ストリーミング蓄積、デデュープ、警告） |
| MessageList.test.ts | 11 | 各 kind の描画、loading 表示 |
| ChatFrame.test.ts | 14 | 送信 → postMessage、ローカルエコー、disabled、host イベント受信反映 |
| chatPanel.test.ts | 17 | spawn 引数、sessionId 捕捉、resume、文脈注入の完全一致、多重送信防止、dispose kill |
| **単体 計** | **143** | `npm run test:unit` |
| 統合（extension.test.ts） | 3 | 実 VSCode 上で activate / コマンド登録 / openChat 実行 |

## 11. ビルド・実行

| 操作 | コマンド |
|---|---|
| ビルド | `npm run build`（esbuild + vite） |
| 単体テスト | `npm run test:unit` |
| 統合テスト | `npm run test:integration`（VSCode を自動ダウンロードして実行） |
| 全テスト | `npm test` |
| デバッグ実行 | VSCode で F5（Extension Development Host） |
| パッケージング | `vsce package` → .vsix ローカルインストール |

## 12. スコープ外・既知の制約

- 認証・権限管理、Marketplace 公開、同時実行制御（1 ユーザー前提）
- 既知の軽微な問題: webview 用 tsconfig で `tsc --noEmit` すると Phase 1 由来の `main.ts` / `vscodeApi.ts` に `dom` lib 不足エラーが 2 件出る（esbuild/vite は型チェックしないため実害なし）
- Webview の `init` メッセージ・`ready` メッセージは現状未使用（将来の永続化復元で使用想定）

## 13. 今後の Phase（未実装）

### Phase 4: 自動レビューマクロ（設計協議中）

Codex 実行 → Claude レビューをワンクリックで連続実行する。

合意済みの設計判断:
- レビュー対象は**案B: git diff 込み + フォールバック** — Codex 完了後に `git diff HEAD` を取得して Claude に渡す（サイズ上限で切詰め）。git リポジトリでない / diff が空の場合はテキストのみ（案A 相当）に自動フォールバック
- Codex 異常終了時は Claude レビューを起動せずエラー表示
- マクロ実行中は通常送信を disabled、実行状態（実行中 / Codex 完了・Claude 起動中 / 完了 / 失敗）を UI 表示
- 文脈は既存の自動デルタ同期がそのまま働く（Codex への指示 + Codex の最終出力は経緯として自動注入されるため、レビュー依頼文に重複埋め込みしない）

未確定: Claude に送るレビュー依頼文のテンプレート（協議継続中）

### Phase 5: スレッド永続化・再表示

- `vscode.globalStorage` にスレッド状態を保存
- 保存対象: projectId / codexThreadId / claudeSessionId / messages[] に加え、**ThreadContext（turns / seen）も必須**（デルタ同期の継続に必要）
- スレッドタブ（複数スレッド切替）UI

## 14. ライセンス

UNLICENSED（個人用・全権利保留）。`package.json` に `"license": "UNLICENSED"` / `"private": true`、`LICENSE` ファイルに All Rights Reserved を明記。将来配布する場合はコントリビューター受け入れ前にライセンス決定（推奨: MIT）。
