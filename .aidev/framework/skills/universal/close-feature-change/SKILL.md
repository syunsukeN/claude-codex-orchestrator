---
name: close-feature-change
description: 検証後に証拠付きTask Closure Noteを作り、実際の変更、計画との差、未解決事項を記録するときに使う。再利用可能な学びがある場合だけProject Learning Candidateを作る。
---

# Feature Changeを完了記録する

## ゴール

実際に変わったこと、検証方法、計画との差、未解決事項を証拠に基づいて記録します。

## 最初に読むファイル

- `.aidev/framework/core/workflows/medium-feature-change.md`
- `.aidev/framework/templates/task-closure-note.md`
- `.aidev/framework/templates/project-learning-candidate.md`
- `.aidev/project/profile.yml`
- Spec、Work Item、差分、検証証拠、Gate結果、人間の判断

フレームワークリポジトリ内では、ルートの対応ファイルを使います。

## 手順

1. 機械検査、`change_gate`、必要な人間レビューが完了していることを確認する。
2. Closure対象となる正確なsource revisionを確認する。
3. 記憶や自己評価ではなく、証拠からOutcomeとActual Changesをまとめる。
4. 機械検査、AC結果、手動確認、Gate指摘を記録する。
5. 大きなPlan Deviationsと未解決事項だけを記録する。
6. 具体的で再利用可能なプロジェクト改善がなければ`learning_candidate`を`none`にする。
7. 学びがある場合だけ別のProject Learning Candidateを作り、参照する。

## 学びを作る条件

将来の同じプロジェクトで役立つ可能性があり、証拠、適用範囲、Rule・Skill・Template・Testなどの反映候補を示せる場合だけ作ります。

一度だけの好み、未確認の推測、一般論は採用しません。プロジェクトまたはフレームワークのルールへ正式反映するには、後で人間レビューが必要です。

## 必要な出力

`paths.closures`へTask Closure Noteを1つ書きます。Feature Spec、全Work Item、具体的なsource revisionを参照し、実際の差分と検証証拠に一致させます。
