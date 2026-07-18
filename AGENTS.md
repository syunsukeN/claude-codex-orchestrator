# プロジェクト固有指示

`CLAUDE.md`が既存のプロジェクト定義の正本です。計画または実装を始める前に読み、技術スタック、PhaseごとのScope、TDDルール、ライセンス制約を確認してください。

コマンドは`package.json`に定義されたものを使用します。`dist/`配下の生成ファイルを直接編集せず、元のソースを変更してBuildし直してください。

<!-- aidev-managed:start version=0.1.0-rc.2 -->

## AI Development Framework

ゴール：承認済みSpecから独立検証まで、挙動変更を追跡可能にする。

- プロジェクト固有指示を、通常のフレームワーク規約より優先する。
- プロジェクトルールは`.aidev/framework/core/policies/safety-baseline.md`を厳しくできるが、弱めることはできない。
- 挙動変更では`.aidev/framework/core/workflows/medium-feature-change.md`を使用する。
- `.agents/skills/`に導入されたタスク固有Skillを使用する。
- Spec、担当Work Item、計画、意図した理由で失敗する受入テストが準備できるまで実装しない。
- Verifier Gateを新しいセッションで実行し、AIの自己申告を完了証拠にしない。
- Scope、契約、依存関係、リスク、本番操作の権限が変わる場合は停止する。

<!-- aidev-managed:end -->
