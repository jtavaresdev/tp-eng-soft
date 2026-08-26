Para padronizar a nomeclature de branches e commit's
## Branches
Para cada issue em progresso, recomenda-se o uso de branches da main ou de um outro issue superior. Atribua a essas branches nomes descritivos, de preferência com o seguinte padrão se for aplicável:
```
<issue type>/<short description>
```
Como os exemplos:
- `chore/update-SQLiteCPP-in-CMake`;
- `task/implementação-da-classe-user`;
- `bugfix/fix-audio-sync`;
Abaixo consta alguns tipos de issue aplicáveis

| **Tipo** | **Descrição**            |
| -------- | ------------------------ |
| feature  | Nova funcionalidade      |
| bugfix   | Correção de bug          |
| task     | Realização de uma tarefa |
| hotfix   | Correção urgente         |
| release  | Preparação de release    |
| docs     | Documentação             |
| refactor | Refatoração              |
| test     | Testes                   |
| chore    | Tarefas de manutenção    |

## Commits
Para facilitar a revisão de Pull Requests, saber identificar bem os commits é uma prática mais que bem vinda. Logo, sempre que aplicável, recomenda-se o uso do padrão:
```
<type>(optional scope): <short description>
```
Por exemplo:
- `feat: add scroble API`;
- `docs: update do tutorial de instalção`;
- `fix (interface): correção da criação de playlists`.
Em commits que entregam muitas modificações, também é recomendável uma descrição melhor no corpo do commit.
Abaixo segue a tabela de tipos de commits que podem ser usados.

| Tipo | Código | Descrição |
| --- | --- | --- |
| feat | `feat` | Nova funcionalidade |
| task | `task` | Tarefa completa |
| fix | `fix` | Correção de bug |
| docs | `docs` | Alterações na documentação |
| style | `style` | Formatação do código |
| refactor | `refactor` | Refatoração de código |
| test | `test` | Adição ou correção de testes |
| chore | `chore` | Atualização de tarefas de build e configurações |
| perf | `perf` | Melhorias de performance |
| build | `build` | Mudanças no sistema de build ou dependências |
| security | `security` | Atualizações de segurança |
| remove | `remove` | Remoção de arquivos |
| revert | `revert` | Revertendo mudanças |
