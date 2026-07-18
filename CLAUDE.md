# Claude Codex Orchestrator - 要件定義書

## コンセプト
VSCode内で動く個人用AIオーケストレーション拡張機能。1つのスレッド内でCodexとClaudeを切り替えながら作業し、AI切替時に直前の出力を次のAIに引き継ぐ。ターミナル2つ開いて手動でやっていた連携を1画面で完結させる。

## 技術スタック
- 拡張機能ホスト: TypeScript + VSCode Extension API
- Webview UI: Svelte 5 + Vite
- CLI実行: child_process.spawn
- CLI出力パース: Claude stream-json / Codex --json
- 状態永続化: vscode.globalStorage
- テスト: @vscode/test-electron + Vitest + jsdom + @testing-library/svelte + sinon
- パッケージング: vsce package → .vsix ローカルインストール

## 全体構成
- サイドバー: プロジェクト一覧（vscode.workspace.workspaceFoldersから自動取得）
- メインWebview（Svelte）:
  - AI切替トグル（Codex ⇄ Claude）
  - スレッドタブ（複数スレッド切替）
  - メッセージ履歴（ストリーミング表示）
  - 入力欄 + 送信
- バックグラウンド:
  - child_process.spawn で codex exec --json / claude -p --output-format json
  - ストリーミング出力をパース → Webviewに転送
  - globalStorage でスレッド状態を永続化

## スレッドモデル
- 1スレッド = {projectId, claudeSessionId, codexSessionId, messages[]}
- メッセージ送信時、選択中AIのセッションをresume or 新規起動
- AI切替時、直前のAIの出力を次のAIのプロンプトに注入
- スレッドはVSCodeのglobalStorageに永続化

## 処理フロー
1. プロジェクト選択 → workspaceFoldersからパス取得 → そのパスをcwdとしてCLI実行
2. メッセージ送信 → 選択中AIのCLIをspawn:
   - Codex: codex exec --json "prompt" (cwd=projectPath)
   - Claude: claude -p --output-format json "prompt" (cwd=projectPath)
3. stream-json / json を行単位でパース → Webviewにトークン単位で転送
4. 完了後、sessionIdを保存
5. AI切替 → 直前のAIの最終出力を取得 → 次のAIのプロンプトに注入 → resume

## Phase分割（TDDで進行）
- Phase 1: 拡張機能土台 + Webview表示 + workspaceFolders取得
- Phase 2: Codex単体チャット（ストリーミング表示）
- Phase 3: Claude単体チャット + AI切替＋文脈引き継ぎ
- Phase 4: 自動レビューマクロ（Codex実行→Claudeレビュー ワンクリック）
- Phase 5: スレッド永続化・再表示

## スコープ外（個人用ゆえ）
- 認証・権限管理: 不要
- Marketplace公開: 不要（vsixローカルインストール）
- 同時実行制御: 1ユーザー前提で最小限
- エラーハンドリング: CLI異常終了はログに出す程度

## 開発原則
- テスト駆動開発（TDD）で進める: Red → Green → Refactor
- Phaseごとに完了条件を満たすテストを先に書き、実装で通す
- 推測で実装しない。不明点は都度質問する

## ライセンス
- 現在: UNLICENSED（個人用・全権利保留）
  - package.json: "license": "UNLICENSED", "private": true
  - LICENSE ファイル: "UNLICENSED - All Rights Reserved"
- 将来配布する場合:
  - コントリビューターを受け入れる前にライセンスを決めること（変更コストを避けるため）
  - 推奨: MIT（VSCode拡張機能で最も標準的）
  - 配布ルート別:
    - vsix直接配布: LICENSE追加だけでOK
    - GitHub公開: リポジトリ公開＋LICENSE追加
    - Marketplace公開: PAT取得＋publisher作成＋vsce publish
