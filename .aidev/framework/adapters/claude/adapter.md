# Claude Adapter

既存の`CLAUDE.md`をプロジェクト指示の正本として残します。`distribution/managed-blocks/CLAUDE.md`の管理ブロックだけを追加すると、導入済みスナップショットの`bootstrap.md`が読み込まれます。

Codexと同じCanonical Universal Skillを`.claude/skills/`へ導入します。モデル固有の差異が実際に確認・記録されるまで、内容を分岐させません。

インポートは起動時に読み込まれるため、`bootstrap.md`を短く保ちます。詳しい役割手順は、必要なときだけ読むSkillへ置きます。
