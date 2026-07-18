---
name: plan-work-items
description: 承認済みFeature Change Specを、独立して検証できるWork Itemへ分割し、コード編集前にリポジトリ調査に基づく最小Implementation Planを作るときに使う。
---

# Work Itemを計画する

## ゴール

全ACを漏れなく扱う、小さくレビュー可能なWork Itemを作り、リポジトリの事実に基づいて計画します。

## 最初に読むファイル

- `.aidev/framework/core/workflows/medium-feature-change.md`
- `.aidev/framework/core/roles/planner.md`
- `.aidev/framework/templates/work-item.md`
- `.aidev/project/profile.yml`
- 承認済みFeature Change Spec

フレームワークリポジトリ内では、ルートの対応ファイルを使います。

## 手順

1. `spec_gate`が成功していることを確認する。未承認Specを黙って修正しない。
2. 技術レイヤーやACごとに機械的分割せず、独立して実装・検証できる結果ごとにACをまとめる。
3. 各Work Itemへ1つのObjective、担当AC、Scope、Out of Scope、Dependencies、Verificationを設定する。
4. 全ACが割り当てられ、依存関係に循環がないことを確認する。
5. セキュリティとデータ保護の条件を、それが守る挙動と同じ変更単位へ含める。
6. リポジトリを読み取り専用で調査し、既存設計、慣習、インターフェース、テストを確認する。
7. `Existing Design`、`Expected Changes`、`Execution Order`、`Verification`、`Risks and Uncertainties`を記入する。
8. 本番コードやテストを編集する前に止まる。

## 再計画する条件

次が判明したら停止し、適切な成果物へ戻ります。

- Scope変更が必要である。
- Specで扱っていない公開APIまたはデータモデル変更が必要である。
- 新しい依存ライブラリが必要である。
- リスクレベルが上がる。
- Work Itemを独立検証できない。

小さなファイル名や作業順序の変更は、後でPlan Amendmentsへ記録できます。

## 必要な出力

Project Profileの`paths.work_items`へWork Itemを書きます。各Work ItemからSpecとAC-IDを参照し、AC本文はコピーしません。
