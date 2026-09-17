USE [master]
GO
/****** Object:  Database [PropertyRentalDB]    Script Date: 9/18/2026 12:40:41 AM ******/
CREATE DATABASE [PropertyRentalDB];
GO

USE [PropertyRentalDB];
GO
ALTER DATABASE [PropertyRentalDB] SET COMPATIBILITY_LEVEL = 170
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [PropertyRentalDB].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [PropertyRentalDB] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [PropertyRentalDB] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [PropertyRentalDB] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [PropertyRentalDB] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [PropertyRentalDB] SET ARITHABORT OFF 
GO
ALTER DATABASE [PropertyRentalDB] SET AUTO_CLOSE ON 
GO
ALTER DATABASE [PropertyRentalDB] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [PropertyRentalDB] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [PropertyRentalDB] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [PropertyRentalDB] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [PropertyRentalDB] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [PropertyRentalDB] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [PropertyRentalDB] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [PropertyRentalDB] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [PropertyRentalDB] SET  ENABLE_BROKER 
GO
ALTER DATABASE [PropertyRentalDB] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [PropertyRentalDB] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [PropertyRentalDB] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [PropertyRentalDB] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [PropertyRentalDB] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [PropertyRentalDB] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [PropertyRentalDB] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [PropertyRentalDB] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [PropertyRentalDB] SET  MULTI_USER 
GO
ALTER DATABASE [PropertyRentalDB] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [PropertyRentalDB] SET DB_CHAINING OFF 
GO
ALTER DATABASE [PropertyRentalDB] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [PropertyRentalDB] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [PropertyRentalDB] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [PropertyRentalDB] SET OPTIMIZED_LOCKING = OFF 
GO
ALTER DATABASE [PropertyRentalDB] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [PropertyRentalDB] SET QUERY_STORE = ON
GO
ALTER DATABASE [PropertyRentalDB] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [PropertyRentalDB]
GO
/****** Object:  Table [dbo].[Payments]    Script Date: 9/18/2026 12:40:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Payments](
	[PaymentID] [int] IDENTITY(1,1) NOT NULL,
	[AgreementID] [int] NOT NULL,
	[Amount] [decimal](18, 2) NOT NULL,
	[DueDate] [date] NOT NULL,
	[PaymentType] [varchar](50) NOT NULL,
	[Status] [varchar](50) NOT NULL,
	[PaidAt] [datetime] NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[PaymentID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Properties]    Script Date: 9/18/2026 12:40:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Properties](
	[PropertyID] [int] IDENTITY(1,1) NOT NULL,
	[OwnerID] [int] NOT NULL,
	[Title] [nvarchar](150) NOT NULL,
	[Description] [nvarchar](max) NULL,
	[PropertyType] [nvarchar](50) NOT NULL,
	[Address] [nvarchar](255) NOT NULL,
	[City] [nvarchar](100) NOT NULL,
	[Bedrooms] [int] NULL,
	[Bathrooms] [int] NULL,
	[MonthlyRent] [decimal](12, 2) NOT NULL,
	[Status] [nvarchar](20) NOT NULL,
	[CreatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[PropertyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PropertyInquiries]    Script Date: 9/18/2026 12:40:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PropertyInquiries](
	[InquiryID] [int] IDENTITY(1,1) NOT NULL,
	[PropertyID] [int] NOT NULL,
	[RenterID] [int] NOT NULL,
	[Message] [nvarchar](1000) NOT NULL,
	[Status] [nvarchar](20) NOT NULL,
	[OwnerReply] [nvarchar](1000) NULL,
	[CreatedAt] [datetime2](7) NULL,
	[RepliedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[InquiryID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PropertyPhotos]    Script Date: 9/18/2026 12:40:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PropertyPhotos](
	[PhotoID] [int] IDENTITY(1,1) NOT NULL,
	[PropertyID] [int] NOT NULL,
	[PhotoURL] [nvarchar](500) NOT NULL,
	[IsPrimary] [bit] NOT NULL,
	[CreatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[PhotoID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RentalAgreements]    Script Date: 9/18/2026 12:40:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RentalAgreements](
	[AgreementID] [int] IDENTITY(1,1) NOT NULL,
	[PropertyID] [int] NOT NULL,
	[OwnerID] [int] NOT NULL,
	[RenterID] [int] NOT NULL,
	[StartDate] [date] NOT NULL,
	[EndDate] [date] NULL,
	[MonthlyRent] [decimal](12, 2) NOT NULL,
	[SecurityDeposit] [decimal](12, 2) NULL,
	[PaymentDueDay] [int] NOT NULL,
	[Status] [nvarchar](20) NOT NULL,
	[CreatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[AgreementID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Transactions]    Script Date: 9/18/2026 12:40:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Transactions](
	[TransactionID] [int] IDENTITY(1,1) NOT NULL,
	[PaymentID] [int] NOT NULL,
	[TransactionReference] [varchar](255) NULL,
	[Amount] [decimal](18, 2) NOT NULL,
	[PaymentMethod] [varchar](50) NOT NULL,
	[Status] [varchar](50) NOT NULL,
	[TransactionDate] [datetime] NOT NULL,
	[FailureReason] [varchar](255) NULL,
	[CreatedAt] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[TransactionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 9/18/2026 12:40:42 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[UserID] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](100) NOT NULL,
	[Email] [nvarchar](255) NOT NULL,
	[PasswordHash] [nvarchar](255) NOT NULL,
	[Role] [nvarchar](20) NOT NULL,
	[Phone] [nvarchar](20) NULL,
	[CreatedAt] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Payments] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Properties] ADD  DEFAULT ('available') FOR [Status]
GO
ALTER TABLE [dbo].[Properties] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[PropertyInquiries] ADD  DEFAULT ('pending') FOR [Status]
GO
ALTER TABLE [dbo].[PropertyInquiries] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[PropertyPhotos] ADD  DEFAULT ((0)) FOR [IsPrimary]
GO
ALTER TABLE [dbo].[PropertyPhotos] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[RentalAgreements] ADD  DEFAULT ((0)) FOR [SecurityDeposit]
GO
ALTER TABLE [dbo].[RentalAgreements] ADD  DEFAULT ((5)) FOR [PaymentDueDay]
GO
ALTER TABLE [dbo].[RentalAgreements] ADD  DEFAULT ('active') FOR [Status]
GO
ALTER TABLE [dbo].[RentalAgreements] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Transactions] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[Payments]  WITH CHECK ADD  CONSTRAINT [FK_Payments_RentalAgreements] FOREIGN KEY([AgreementID])
REFERENCES [dbo].[RentalAgreements] ([AgreementID])
GO
ALTER TABLE [dbo].[Payments] CHECK CONSTRAINT [FK_Payments_RentalAgreements]
GO
ALTER TABLE [dbo].[Properties]  WITH CHECK ADD  CONSTRAINT [FK_Properties_Owner] FOREIGN KEY([OwnerID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[Properties] CHECK CONSTRAINT [FK_Properties_Owner]
GO
ALTER TABLE [dbo].[PropertyInquiries]  WITH CHECK ADD  CONSTRAINT [FK_PropertyInquiries_Property] FOREIGN KEY([PropertyID])
REFERENCES [dbo].[Properties] ([PropertyID])
GO
ALTER TABLE [dbo].[PropertyInquiries] CHECK CONSTRAINT [FK_PropertyInquiries_Property]
GO
ALTER TABLE [dbo].[PropertyInquiries]  WITH CHECK ADD  CONSTRAINT [FK_PropertyInquiries_Renter] FOREIGN KEY([RenterID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[PropertyInquiries] CHECK CONSTRAINT [FK_PropertyInquiries_Renter]
GO
ALTER TABLE [dbo].[PropertyPhotos]  WITH CHECK ADD  CONSTRAINT [FK_PropertyPhotos_Property] FOREIGN KEY([PropertyID])
REFERENCES [dbo].[Properties] ([PropertyID])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[PropertyPhotos] CHECK CONSTRAINT [FK_PropertyPhotos_Property]
GO
ALTER TABLE [dbo].[RentalAgreements]  WITH CHECK ADD  CONSTRAINT [FK_RentalAgreements_Owner] FOREIGN KEY([OwnerID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[RentalAgreements] CHECK CONSTRAINT [FK_RentalAgreements_Owner]
GO
ALTER TABLE [dbo].[RentalAgreements]  WITH CHECK ADD  CONSTRAINT [FK_RentalAgreements_Property] FOREIGN KEY([PropertyID])
REFERENCES [dbo].[Properties] ([PropertyID])
GO
ALTER TABLE [dbo].[RentalAgreements] CHECK CONSTRAINT [FK_RentalAgreements_Property]
GO
ALTER TABLE [dbo].[RentalAgreements]  WITH CHECK ADD  CONSTRAINT [FK_RentalAgreements_Renter] FOREIGN KEY([RenterID])
REFERENCES [dbo].[Users] ([UserID])
GO
ALTER TABLE [dbo].[RentalAgreements] CHECK CONSTRAINT [FK_RentalAgreements_Renter]
GO
ALTER TABLE [dbo].[Transactions]  WITH CHECK ADD  CONSTRAINT [FK_Transactions_Payments] FOREIGN KEY([PaymentID])
REFERENCES [dbo].[Payments] ([PaymentID])
GO
ALTER TABLE [dbo].[Transactions] CHECK CONSTRAINT [FK_Transactions_Payments]
GO
ALTER TABLE [dbo].[Properties]  WITH CHECK ADD  CONSTRAINT [CK_Properties_Status] CHECK  (([Status]='inactive' OR [Status]='rented' OR [Status]='available'))
GO
ALTER TABLE [dbo].[Properties] CHECK CONSTRAINT [CK_Properties_Status]
GO
ALTER TABLE [dbo].[Properties]  WITH CHECK ADD  CONSTRAINT [CK_Properties_Type] CHECK  (([PropertyType]='portion' OR [PropertyType]='room' OR [PropertyType]='apartment' OR [PropertyType]='house'))
GO
ALTER TABLE [dbo].[Properties] CHECK CONSTRAINT [CK_Properties_Type]
GO
ALTER TABLE [dbo].[PropertyInquiries]  WITH CHECK ADD  CONSTRAINT [CK_PropertyInquiries_Status] CHECK  (([Status]='closed' OR [Status]='replied' OR [Status]='pending'))
GO
ALTER TABLE [dbo].[PropertyInquiries] CHECK CONSTRAINT [CK_PropertyInquiries_Status]
GO
ALTER TABLE [dbo].[RentalAgreements]  WITH CHECK ADD  CONSTRAINT [CK_RentalAgreements_PaymentDueDay] CHECK  (([PaymentDueDay]>=(1) AND [PaymentDueDay]<=(28)))
GO
ALTER TABLE [dbo].[RentalAgreements] CHECK CONSTRAINT [CK_RentalAgreements_PaymentDueDay]
GO
ALTER TABLE [dbo].[RentalAgreements]  WITH CHECK ADD  CONSTRAINT [CK_RentalAgreements_Status] CHECK  (([Status]='pending' OR [Status]='terminated' OR [Status]='completed' OR [Status]='active'))
GO
ALTER TABLE [dbo].[RentalAgreements] CHECK CONSTRAINT [CK_RentalAgreements_Status]
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD  CONSTRAINT [CK_Users_Role] CHECK  (([Role]='renter' OR [Role]='owner' OR [Role]='admin'))
GO
ALTER TABLE [dbo].[Users] CHECK CONSTRAINT [CK_Users_Role]
GO
USE [master]
GO
ALTER DATABASE [PropertyRentalDB] SET  READ_WRITE 
GO
