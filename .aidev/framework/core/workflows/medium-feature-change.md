# Medium Feature Changeワークフロー

RC2で実装・検証する唯一のワークフローです。役割を分けることは、3つのAgentを同時に動かすことではありません。同じモデルを別セッションで使うこともできます。

## 全体の流れ

```text
要求
  -> Feature Change Spec
  -> Verifier: spec_gate
  -> Work Item分解と検証設計
  -> Planner: Implementation Plan
  -> Verifier: 先に失敗する受入テスト
  -> Implementer
  -> 自動検証
  -> Verifier: change_gate
  -> 人間レビューと手動動作確認
  -> Task Closure Note
  -> 必要な場合だけProject Learning Candidate
```

## 1. Feature Change Spec

入力：曖昧な要求、リポジトリから確認した事実、人間の判断。

出力：Requirement IDとAC-IDがプロジェクト内で重複しない、承認済みFeature Change Spec。

終了条件：

- Objective、Scope、Out of Scopeが明確である。
- blockingの質問が解決している。
- ACがテスト可能である。
- Verification Strategyが全ACを扱っている。
- リスクが`medium`として記録されている。

要求、AC、Scope、リスクが不明または変更されたらここへ戻ります。

## 2. `spec_gate`

Verifierを新しいセッションで実行します。Implementation Planや実装コードは渡しません。

終了条件：blocking指摘がなくなり、人間がSpec契約を承認する。

挙動の不足や矛盾があればFeature Change Specへ戻ります。

## 3. Work Itemと検証設計

技術レイヤー単位やACごとに機械的分割せず、独立して実装・検証できる縦の変更単位へ分けます。

出力：

- 全ACが少なくとも1つのWork Itemへ割り当てられている。
- 各Work Itemに1つの目的、Scope、Out of Scope、依存関係、検証対応がある。
- 安全を守る横断条件が、保護対象の挙動と同時に提供される。
- 循環依存や曖昧な検証責任がない。

Work Itemを独立実装・検証できない場合は分解へ戻ります。

## 4. Implementation Plan

Plannerがコードを編集せずリポジトリを調査し、Work Item内の計画を記入します。

終了条件：Spec契約を変更せず、Existing Design、Expected Changes、Execution Order、Verification、Risks and Uncertaintiesが示されている。

計画の誤りはWork Itemへ戻します。契約変更が必要ならSpecへ戻します。

## 5. 先に失敗する受入テスト

Verifierの`acceptance_test`を新しいセッションで実行します。

終了条件：

- テストがAC-IDを参照する。
- 全ACにテスト参照がある。
- 新しいテストが実装前に失敗する。
- 失敗理由が未実装の挙動であり、構文、環境、セットアップ不良ではない。

契約が誤っていればSpec、検証境界が誤っていればWork Item、失敗方法が誤っていればテストへ戻ります。

## 6. 実装

Implementerへ承認済み成果物と失敗中のテストを渡します。

終了条件：

- 担当ACのテストが成功する。
- 対象プロジェクトのBuild、Lint、Type Check、Testが必要に応じて成功する。
- 大きな計画逸脱がPlan Amendmentsで説明されている。
- 未解決のScope変更やリスク上昇がない。

通常のテスト失敗は実装へ戻します。Scope、契約、依存関係、データモデル、リスクが変わる場合は止まって再計画します。

## 7. `change_gate`

Verifierを別の新しいセッションで実行します。

終了条件：

- 全ACに証拠付きの判定がある。
- blockingとなる不一致、不足テスト、危険な途中状態、Scope外変更がない。
- 検証証拠を確認できる。

指摘内容に応じてSpec、Work Item、テスト、Implementerへ戻ります。

## 8. 人間レビューと手動動作確認

人間が業務上の意図、重要な指摘、実際の挙動を確認します。AIの自己申告だけでは完了できません。

終了条件：人間が変更を承認する、または前工程へ戻す。

## 9. Task Closure Note

Spec、Work Item、対象リビジョン、検証、実際の変更、計画差分、指摘、未解決事項を参照するClosureを1つ作ります。

証拠と一致しなければClosure Noteを修正します。

## 10. 任意のProject Learning Candidate

再利用できるプロジェクト改善がある場合だけ、別の候補を作ります。毎回無理に学びを作りません。正式採用には、後で人間の確認が必要です。
