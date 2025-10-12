-- AlterTable
ALTER TABLE "meal_logs" ADD COLUMN     "foodName" TEXT,
ADD COLUMN     "wasSuccessful" BOOLEAN;

-- AlterTable
ALTER TABLE "safe_foods" ADD COLUMN     "isEstablishedSafeFood" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastConsumedDate" TIMESTAMP(3),
ADD COLUMN     "personalRating" INTEGER,
ADD COLUMN     "timesConsumed" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "dateFirstAccepted" DROP NOT NULL;
