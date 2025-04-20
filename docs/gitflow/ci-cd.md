# ⚖️ CI/CD - Conceptos y Beneficios

## Definiciones

- **Integración continua (CI)**: Automatiza pruebas y validaciones al hacer push al repositorio.
- **Despliegue continuo (CD)**: Automatiza el paso de versiones a entornos de staging o producción.

## Beneficios

- Detectar errores rápidamente
- Reducir trabajo manual
- Entregas más seguras y frecuentes

## 🎟️ Diagrama del pipeline CI/CD

```mermaid
flowchart TD
  A[Push a rama] --> B{Tipo de rama}
  B -->|feature/*| C[Run: Lint + Test]
  B -->|release/*| C2[Run: Lint + Test + Build]
  B -->|main| D[Run: Full pipeline]
  D --> E[Despliegue Producción]
  C2 --> F[Despliegue Staging]
```
