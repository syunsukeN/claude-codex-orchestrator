# AI Development Framework Bootstrap

挙動を変更する場合は、導入済みのMedium Feature Changeワークフローを使用します。

常に次を守ります。

- プロジェクト固有指示を、通常のフレームワーク規約より優先する。
- プロジェクトルールは`.aidev/framework/core/policies/safety-baseline.md`を厳しくできるが、弱めることはできない。
- 現在の工程に必要なワークフローとSkillだけを読む。
- Spec、担当Work Item、計画、失敗する受入テストが準備できるまで実装しない。
- Verifier契約に従い、`spec_gate`、`acceptance_test`、`change_gate`を新しいセッションで実行する。
- AIの自己申告を完了証拠にせず、機械検査と人間レビューを必要とする。
- Scope、契約、依存関係、リスク、本番操作の権限が変わる場合は停止する。

Universal Skillは`.claude/skills/`、固定版の正本は`.aidev/framework/`にあります。
