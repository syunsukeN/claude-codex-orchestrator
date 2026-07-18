---
name: define-feature-change
description: 曖昧な機能要求を、レビュー可能なFeature Change Specへ整理する。実装前に挙動、Scope、Acceptance Criteria、検証方法、リスクについて人間とAIで合意するときに使う。
---

# Feature Changeを定義する

## ゴール

実装方法を決めすぎず、人間とAIが「何を満たせば正しいか」を同じように判断できるFeature Change Specを1つ作ります。

## 最初に読むファイル

プロジェクトルートから、存在する次の導入済みファイルを読みます。

- `.aidev/framework/core/workflows/medium-feature-change.md`
- `.aidev/framework/core/policies/safety-baseline.md`
- `.aidev/framework/core/policies/risk-levels.md`
- `.aidev/framework/templates/feature-change-spec.md`
- `.aidev/project/profile.yml`

フレームワークリポジトリ自体を開発している場合は、`core/`と`templates/`の対応ファイルを使います。

## 手順

1. 要求を読み、現在の挙動を理解するために必要な範囲だけリポジトリを調査する。
2. 確認済みの事実、人間の決定、仮定、未決事項を分ける。
3. blockingとなる判断を一度に1つずつ質問する。用語を簡単に説明し、その場のゴールを示す。
4. Background、Objective、Current Behavior、Scope、Out of Scopeを書く。
5. Requirementと外から確認できるACを、プロジェクト内で重複しないID付きで書く。
6. 全ACへ検証方法を割り当てる。正常、エラー、境界値、認可、必要な性能条件を扱う。
7. リスクと不確実性を記録する。安全基準を弱めない。
8. Implementation Planやコード変更へ進む前に止まる。

## 必要な出力

Project Profileの`paths.specs`へ、Feature Change Specテンプレートを使って1つ保存します。

次を満たした場合だけ`spec_gate`へ進めます。

- blockingの質問が解決している。
- ScopeとOut of Scopeが矛盾していない。
- 全ACが外から確認でき、テスト可能である。
- 全ACにVerification Strategyがある。
- Requirement IDとAC-IDが重複していない。
- リスクに理由がある。

## 注意事項

- 不足しているプロダクト判断を作り上げない。
- 不確実性を自信のある文章の中へ隠さない。
- ファイル単位の実装手順や詳しいコード設計を書かない。
- 同じ要求を少しずつ変えて複数ACへ重複させない。
- AIの承認を人間の承認として扱わない。
