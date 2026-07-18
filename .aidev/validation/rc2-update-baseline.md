# RC2更新時の基準結果

## ゴール

`ai-dev-framework v0.1.0-rc.1`から`v0.1.0-rc.2`へ更新した後も、固定版の整合性と`claude-codex-orchestrator`の既存動作が保たれていることを確認する。

## 対象revision

- アプリ更新開始地点：`9844955`
- フレームワーク：`683b4503eac8ec69785776af68c897ffdb4db718`
- フレームワークversion：`0.1.0-rc.2`

## 結果

| 確認 | 結果 | 証拠 |
|---|---|---|
| 固定スナップショット比較 | 成功 | core、templates、adapters、skills、docs、eval、doctorがRC2原本と一致した。 |
| Codex・Claude Skill検査 | 成功 | 2つの発見場所にある合計10個のSkillが形式検査を通過した。 |
| `npm run build` | 成功 | ExtensionとWebviewの本番Buildが完了した。 |
| `npm run test:unit` | 成功 | 10ファイル、143テストが成功した。 |
| `npm run test:integration` | 成功 | VS Code拡張機能の統合テスト3件が成功した。 |
| doctorの導入関連検査 | 成功 | lock、導入version、AGENTS管理ブロック、CLAUDE管理ブロックがRC2で一致した。 |
| doctorの完了タスク検査 | 未実施 | 最初のFeature Spec、Work Item、Closureがまだ存在しないため、既知の3件が失敗した。 |

## 更新で確認できたこと

- プロジェクト所有の`CLAUDE.md`本文を変更せず、管理ブロックだけをRC2へ更新できた。
- 人間向け文章を日本語化しても、機械向けID、Skill形式、Build、Testは壊れなかった。
- 手動更新ではSkillを3か所へコピーする必要があり、`FIND-RC1-004`の運用負担は残っている。
