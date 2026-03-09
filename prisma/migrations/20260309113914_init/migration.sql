-- CreateTable
CREATE TABLE "Speciality" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Speciality_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Speciality_title_key" ON "Speciality"("title");

-- CreateIndex
CREATE INDEX "idx_speciality_isDeleted" ON "Speciality"("isDeleted");

-- CreateIndex
CREATE INDEX "idx_speciality_title" ON "Speciality"("title");
