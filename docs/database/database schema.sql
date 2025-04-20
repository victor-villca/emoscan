CREATE TABLE "users" (
  "id" serial PRIMARY KEY,
  "name" varchar(255) NOT NULL,
  "email" varchar(255) UNIQUE NOT NULL,
  "password_hash" varchar(255) NOT NULL,
  "role" varchar(50) DEFAULT 'user',
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

CREATE TABLE "sessions" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL,
  "session_date" timestamp DEFAULT (now()),
  "duration_minutes" integer,
  "notes" text,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "emotion_metrics" (
  "id" serial PRIMARY KEY,
  "session_id" integer NOT NULL,
  "emotion" varchar(50) NOT NULL,
  "intensity" decimal(3,2) NOT NULL,
  "timestamp" timestamp NOT NULL
);

CREATE TABLE "reports" (
  "id" serial PRIMARY KEY,
  "session_id" integer NOT NULL,
  "report_path" varchar(255) NOT NULL,
  "generated_at" timestamp DEFAULT (now())
);

CREATE TABLE "faces" (
  "id" serial PRIMARY KEY,
  "session_id" integer NOT NULL,
  "image_path" varchar(255) NOT NULL,
  "detected_at" timestamp DEFAULT (now())
);

COMMENT ON TABLE "users" IS 'Usuarios del sistema (administradores, terapeutas, pacientes)';

COMMENT ON TABLE "sessions" IS 'Videollamadas donde se analizan emociones';

COMMENT ON TABLE "emotion_metrics" IS 'Métricas emocionales detectadas en tiempo real durante la sesión';

COMMENT ON COLUMN "emotion_metrics"."emotion" IS 'Ej: happy, sad, angry, surprised';

COMMENT ON COLUMN "emotion_metrics"."intensity" IS 'Nivel de intensidad entre 0.00 y 1.00';

COMMENT ON TABLE "reports" IS 'Informes PDF generados al finalizar cada sesión';

COMMENT ON COLUMN "reports"."report_path" IS 'Ruta al archivo PDF generado';

COMMENT ON TABLE "faces" IS 'Capturas faciales relevantes durante la sesión para evidencia visual o entrenamiento';

ALTER TABLE "sessions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "emotion_metrics" ADD FOREIGN KEY ("session_id") REFERENCES "sessions" ("id");

ALTER TABLE "reports" ADD FOREIGN KEY ("session_id") REFERENCES "sessions" ("id");

ALTER TABLE "faces" ADD FOREIGN KEY ("session_id") REFERENCES "sessions" ("id");
