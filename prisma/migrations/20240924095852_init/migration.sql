-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "profileUrl" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "name" TEXT,
    "username" TEXT,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "introduction" TEXT,
    "understand" TEXT,
    "leadUsed" INTEGER DEFAULT 0,
    "postcode" TEXT,
    "trade" TEXT,
    "distance" TEXT,
    "password" TEXT NOT NULL,
    "customerid" TEXT,
    "subscription" BOOLEAN DEFAULT false,
    "roleId" INTEGER,
    "type" TEXT NOT NULL DEFAULT 'Free',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradepersonDetail" (
    "id" SERIAL NOT NULL,
    "info" JSONB NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "TradepersonDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeService" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TradeService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeLocation" (
    "id" SERIAL NOT NULL,
    "postcode" TEXT NOT NULL,
    "distance" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TradeLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "area" TEXT NOT NULL,

    CONSTRAINT "PostCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MainTradeService" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "MainTradeService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "MainTradeId" INTEGER NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicesQuestion" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answers" TEXT[],

    CONSTRAINT "servicesQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTP" (
    "id" SERIAL NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jobs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "postcode" TEXT,
    "job" JSONB NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "interestedTradepersons" INTEGER[],

    CONSTRAINT "Jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quotes" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "tradepersonId" INTEGER NOT NULL,
    "quotePrice" INTEGER,
    "isViewed" BOOLEAN NOT NULL DEFAULT false,
    "requested" BOOLEAN NOT NULL DEFAULT false,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "userid" INTEGER NOT NULL,
    "status" TEXT,
    "customerid" TEXT,
    "subsid" TEXT NOT NULL,
    "price" TEXT,
    "createdAt" INTEGER,
    "expiredAt" INTEGER,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription_Type" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "leadCount" INTEGER,

    CONSTRAINT "Subscription_Type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Viewed_leads" (
    "id" SERIAL NOT NULL,
    "tradepersonId" INTEGER NOT NULL,
    "JobId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Viewed_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "TradepersonDetail_userId_idx" ON "TradepersonDetail"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PostCode_code_key" ON "PostCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "MainTradeService_type_key" ON "MainTradeService"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Service_type_key" ON "Service"("type");

-- CreateIndex
CREATE INDEX "Service_type_idx" ON "Service"("type");

-- CreateIndex
CREATE INDEX "servicesQuestion_serviceId_idx" ON "servicesQuestion"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "OTP_phoneNumber_key" ON "OTP"("phoneNumber");

-- CreateIndex
CREATE INDEX "Jobs_userId_idx" ON "Jobs"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_subsid_key" ON "Subscription"("subsid");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_Type_type_key" ON "Subscription_Type"("type");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_type_fkey" FOREIGN KEY ("type") REFERENCES "Subscription_Type"("type") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradepersonDetail" ADD CONSTRAINT "TradepersonDetail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeService" ADD CONSTRAINT "TradeService_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeService" ADD CONSTRAINT "TradeService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeLocation" ADD CONSTRAINT "TradeLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_MainTradeId_fkey" FOREIGN KEY ("MainTradeId") REFERENCES "MainTradeService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicesQuestion" ADD CONSTRAINT "servicesQuestion_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jobs" ADD CONSTRAINT "Jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotes" ADD CONSTRAINT "Quotes_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotes" ADD CONSTRAINT "Quotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quotes" ADD CONSTRAINT "Quotes_tradepersonId_fkey" FOREIGN KEY ("tradepersonId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Viewed_leads" ADD CONSTRAINT "Viewed_leads_tradepersonId_fkey" FOREIGN KEY ("tradepersonId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Viewed_leads" ADD CONSTRAINT "Viewed_leads_JobId_fkey" FOREIGN KEY ("JobId") REFERENCES "Jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
