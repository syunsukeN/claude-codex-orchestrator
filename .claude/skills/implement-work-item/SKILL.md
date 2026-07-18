---
name: implement-work-item
description: 承認済みWork Itemを、Spec、Implementation Plan、先に失敗する受入テストに基づいて実装するときに使う。機械検査の証拠と、大きな計画差分の理由も残す。
---

# Work Itemを実装する

## ゴール

承認済み契約を広げず、担当ACを満たす保守可能な最小変更を作ります。

## 最初に読むファイル

- `.aidev/framework/core/roles/implementer.md`
- `.aidev/framework/core/workflows/medium-feature-change.md`
- `.aidev/framework/core/policies/safety-baseline.md`
- `.aidev/project/profile.yml`
- 承認済みFeature Change Specと対象Work Item
- 実装前の受入テスト失敗記録

フレームワークリポジトリ内では、ルートの対応ファイルを使います。

## 開始条件

次を満たすまで本番コードを変更しません。

- `spec_gate`が成功している。
- Work ItemとImplementation Planが承認されている。
- 担当ACと検証方法が明確である。
- 受入テストが未実装の挙動を理由に失敗している。
- blockingの不確実性が残っていない。

## 手順

1. 受入テストの想定された失敗を再現する。
2. リポジトリの既存設計とプロジェクト固有指示に従う。
3. Work ItemのScopeだけを実装し、必要なら対象を絞った下位テストを追加する。
4. 担当ACのテストとProject Profileの機械検査を実行する。
5. 大きなPlan Amendmentsと理由を記録する。
6. 実際の変更、実行コマンドと結果、未解決事項、後続Gate用の証拠を報告する。

## 停止して再計画する条件

次が必要なら続行前に止まります。

- ACまたはScopeの変更
- 想定外の公開APIまたはデータモデル変更
- 依存ライブラリの追加
- プロジェクトの安全境界を越える操作
- リスクレベルの上昇
- 本番環境への作用

通常のコンパイル・テスト失敗は実装作業として扱います。成功させる目的でテストを弱めません。

## 完了の境界

テスト成功だけでは最終承認になりません。独立した`change_gate`、人間レビュー、手動動作確認が必要です。
