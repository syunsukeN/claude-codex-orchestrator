# リスクレベル

RC2で実装・検証するのは`medium`ワークフローだけです。

| レベル | RC2の状態 | 意味 |
|---|---|---|
| `low` | `defined_not_validated` | 影響が小さい変更。詳しい運用は未検証です。 |
| `medium` | `implemented` | RC2の一連の契約を適用する通常の機能変更です。 |
| `high` | `defined_not_validated` | 重大な影響または復旧困難性がある変更。より強いプロジェクト固有制御と人間確認が必要ですが、詳しい運用は未検証です。 |

## Mediumの契約

```yaml
feature_spec: required
acceptance_criteria: required
spec_gate: required
implementation_plan: required
independent_verifier: required
acceptance_test_before_implementation: required
automated_verification: required
human_review: required
manual_behavior_check: required
closure_note: required
learning_candidate: optional
```

認証、認可、決済、個人情報、破壊的なデータ変更、公開API、本番インフラ、元に戻すのが難しいマイグレーションは高リスクの目印です。RC2では検出・記録しますが、高リスク運用を検証済みとは扱いません。
