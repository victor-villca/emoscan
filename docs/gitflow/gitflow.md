# Diagrama de flujo de ramas (GitFlow)

```mermaid
gitGraph
   commit id: "Inicial"
   branch develop
   checkout develop
   commit id: "Setup del proyecto"
   branch feature/login
   commit id: "Funcionalidad de login"
   commit id: "Validaciones"
   checkout develop
   merge feature/login tag: "v0.1.0"
   branch feature/emotion-recognition
   commit id: "Reconocimiento facial básico"
   checkout develop
   merge feature/emotion-recognition tag: "v0.2.0"
   branch release/v1.0.0
   commit id: "Preparación para producción"
   checkout main
   merge release/v1.0.0 tag: "v1.0.0"
   branch hotfix/patch-session-bug
   commit id: "Corrección de bug en sesión"
   checkout main
   merge hotfix/patch-session-bug tag: "v1.0.1"
   checkout develop
   merge hotfix/patch-session-bug
```

## 📁 Convención de nombres de ramas

### Prefijos por tipo:
- **feature/** - para nuevas funcionalidades
- **release/** - para preparación de versiones
- **hotfix/** - para correcciones urgentes
- **bugfix/** - para correcciones menores no urgentes
- **test/** - para experimentación o pruebas

### Ejemplos:
- `feature/login-google`
- `release/2.0.0`
- `hotfix/fix-prod-db`

## 🗒️ Convención de Commits

### Estructura sugerida:
`tipo: descripción breve del cambio`

### Tabla de commits:

| Tipo | Descripción |
|------|-------------|
| feature | Nueva funcionalidad |
| fix | Corrección de error |
| refactor | Refactor de código |
| docs | Cambios en documentación |
| remove | Eliminación de código o archivos |
| test | Añadir/modificar pruebas |
| deploy | Preparación o acciones de despliegue |