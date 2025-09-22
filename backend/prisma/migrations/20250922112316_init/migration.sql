-- CreateTable
CREATE TABLE "public"."Url" (
    "id" SERIAL NOT NULL,
    "longUrl" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Url_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Url_longUrl_key" ON "public"."Url"("longUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Url_shortCode_key" ON "public"."Url"("shortCode");
