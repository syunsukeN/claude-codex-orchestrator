---
name: verify-feature-change
description: 新しいセッションで独立したSpec Gate、実装前の受入テスト作成、完成後の変更レビューを行うときに使う。Implementerの前提へ引っ張られず、承認済み契約と証拠を確認する。
---

# Feature Changeを検証する

## ゴール

Implementerの前提を引き継がず、契約と証拠を独立して確認します。

## 実行を1つ選ぶ

各実行を別の新しいセッションで行います。

- `spec_gate`：Work Item計画前にSpecを確認する。
- `acceptance_test`：本番実装前にテストを作り、意図した理由で失敗することを示す。
- `change_gate`：完成した差分と証拠を確認し、自分では修正しない。

次を読みます。

- `.aidev/framework/core/roles/verifier.md`
- `.aidev/framework/core/workflows/medium-feature-change.md`
- `.aidev/framework/core/policies/safety-baseline.md`
- `.aidev/project/profile.yml`

フレームワークリポジトリ内では、ルートの対応ファイルを使います。

## `spec_gate`

Spec、Project Profile、関係する既存挙動、公開インターフェースだけを確認します。Implementation Plan、コード変更、Implementerの自己評価を入力にしません。

`pass`または`fail`、証拠付きのblocking指摘、non-blocking指摘、不足AC、質問を返します。

## `acceptance_test`

承認済みSpecとWork Itemを読み、既存テストの慣習に従ってAC-IDを含む受入テストまたは契約テストを作ります。

実装前に新しいテストを実行し、挙動が未実装であるため失敗することを記録します。セットアップ、構文、環境、無関係な失敗は有効な失敗と扱いません。

本番コードを実装せず、既存コードへ合わせる目的で契約を変更しません。

## `change_gate`

承認済み契約、Work Item、計画、テスト、実装差分、機械検査結果、Plan Amendmentsを読みます。

次を返します。

- `pass`または`fail`
- 重要度順の証拠付き指摘
- ACごとのカバレッジと結果表
- 不足テスト、Scope違反、理由のない計画逸脱、リスク変化
- blocking指摘を戻す工程

このGate中に実装を編集しません。

## 独立性のルール

別モデルの利用は任意です。新しいコンテキストと、証拠に基づく批判的な確認は必須です。Agentやモデルの数を増やすだけでは品質保証になりません。
