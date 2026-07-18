# RC2の手動導入

## ゴール

フレームワークのGit履歴を対象プロジェクトへ混ぜず、既存のプロジェクト指示を置き換えずに、固定版を追跡可能な形で導入します。

## 導入手順

このリポジトリのcheckoutまたはrelease archiveから、次を行います。

1. `core/`、`templates/`、`adapters/`、`skills/`、`scripts/`、`eval/`、`docs/`、`VERSION`を対象プロジェクトの`.aidev/framework/`へコピーする。
2. `distribution/project/.aidev/`を対象へコピーし、既存のプロジェクトファイルは残す。
3. `.aidev/framework.lock`と`.aidev/project/profile.yml`のplaceholderをすべて対象プロジェクトの値へ置き換える。
4. `.aidev/framework/skills/universal/`配下の各Skillフォルダを、`.agents/skills/`と`.claude/skills/`の両方へコピーする。
5. `AGENTS.md`または`CLAUDE.md`がなければ、対応する管理ブロックで作成する。既に存在する場合は、管理ブロックだけを追記し、その外側を変更しない。
6. 既存のプロジェクト指示とフレームワークの矛盾を解消する。
7. `.aidev/framework/scripts/doctor /path/to/target-project`を実行する。

フレームワークリポジトリ全体を対象プロジェクトへ上書きしません。フレームワーク所有の`AGENTS.override.md`を作りません。

## 導入後の形

```text
target-project/
├── .aidev/
│   ├── framework/
│   ├── project/profile.yml
│   ├── framework.lock
│   ├── specs/
│   ├── work-items/
│   └── closures/
├── .agents/skills/
├── .claude/skills/
├── AGENTS.md
└── CLAUDE.md
```

RC2は意図的に手動コピーを使います。実プロジェクトで配置が安定するまで、InstallerやUpdate CLIは作りません。

## 既知の制約

- RC2のdoctorは、完了したFeature Change全体を検査するため、導入直後はSpec、Work Item、Closure不足を失敗として報告します。
- 導入だけを検査するモードは次版の改善候補です。導入直後は、版、lock、管理ブロックの結果を個別に確認してください。
