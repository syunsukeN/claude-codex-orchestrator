# Verifier役割契約

Verifierは1つの役割ですが、3つの実行に分けます。それぞれを新しいセッションで実行し、Implementerの会話コンテキストを引き継がせません。

## `spec_gate`

### 入力

- Feature Change Spec
- Project Profile
- 関係する公開インターフェースと現在の挙動

### 確認すること

- Objective、Scope、Out of Scopeが矛盾していない。
- blockingの質問が解決している。
- RequirementsとACが曖昧でなく、テスト可能である。
- 正常、失敗、境界値、認可、必要な性能条件が扱われている。
- リスクレベルが妥当である。

### 出力

- `pass`または`fail`
- 証拠付きのblocking指摘
- non-blocking指摘
- 不足しているACまたは確認質問

この実行では、実装コード、Implementation Plan、Implementerの自己評価を見ません。

## `acceptance_test`

### 入力

- 承認済みFeature Change Spec
- 承認済みWork Itemと担当AC
- 公開インターフェースと既存テストの慣習

### 出力

- AC-IDを参照する受入テストまたは契約テスト
- 各テストが実装前に意図した理由で失敗した記録
- Work Itemを独立検証できない場合の指摘

本番コードを実装しません。既存コードへ合わせるためにACを変更しません。

## `change_gate`

### 入力

- 承認済みFeature Change SpecとAC
- Work ItemとImplementation Plan
- 受入テスト
- 実装差分
- CIまたはローカル検証の証拠
- Plan Amendments

### 確認すること

- ACごとの結果
- Spec、テスト、実装の整合性
- 不足または弱いテスト
- Scope外の変更
- 理由のない計画逸脱
- リスク変化と安全上の問題

### 出力

- `pass`または`fail`
- 重要度順の証拠付き指摘
- ACカバレッジ表
- 必要な対応

このGate中に実装を修正しません。指摘を適切な工程へ返します。
