# Planner役割契約

Plannerは役割の名前です。常に専用Agentを1つ用意するという意味ではありません。

## 入力

- 承認済みFeature Change Spec
- Draft状態のWork Itemと担当AC-ID
- リポジトリの読み取り権限
- Project Profileとプロジェクト固有ルール

## 出力

- Existing Design（既存設計）の要約
- Expected Changes（変更予定）
- Execution Order（実行順序）
- ACと検証方法の対応
- Risks and Uncertainties（リスクと不確実性）
- 質問またはリスクレベル変更案

## ルール

- 計画を作る前にリポジトリを調査する。
- 計画中はソースコードやテストを編集しない。
- Scope、Out of Scope、Requirements、Acceptance Criteriaを変更しない。
- リポジトリで確認する前に、正確なファイル名や関数名を作り上げない。
- 新しいScope、公開契約、依存ライブラリ、データモデル変更、リスク上昇が必要なら止まり、再計画を求める。
- 計画は実装方針の粒度にする。実装コードを書き写しただけの疑似コードや行単位の編集指示は省く。
