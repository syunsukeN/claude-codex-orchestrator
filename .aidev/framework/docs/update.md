# RC2の手動更新

## ゴール

プロジェクト所有の指示を上書きせず、ローカル変更を隠さずに、対象プロジェクトを新しい固定版へ更新します。

## ルール

1. 対象プロジェクトの作業ツリーがクリーンな状態で専用ブランチを作り、現在のlockを記録する。
2. 導入済み`.aidev/framework/`と、lockに記録されたreleaseを比較する。ローカル変更があれば更新を止め、所属先を判断する。
3. `.aidev/framework/`だけを新しいrelease snapshotへ置き換える。
4. 新しいCanonical Skillから`.agents/skills/`と`.claude/skills/`を更新する。
5. `AGENTS.md`と`CLAUDE.md`は管理マーカーの内側だけを更新する。外側を変更しない。
6. `framework.lock`のversion、commit、installed_at、管理ブロック情報を更新する。
7. doctorと小さな評価ケースを1件実行してから通常利用する。

管理ブロックに人間の変更がある場合は、自動上書きしません。差分を示し、人間の判断を求めます。
