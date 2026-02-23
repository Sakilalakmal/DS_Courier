BEGIN TRY

BEGIN TRAN;

IF OBJECT_ID(N'[dbo].[shipment_events]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[shipment_events] (
        [id] NVARCHAR(1000) NOT NULL,
        [eventId] NVARCHAR(1000) NOT NULL,
        [shipmentId] NVARCHAR(1000) NOT NULL,
        [trackingId] NVARCHAR(1000) NOT NULL,
        [oldStatus] NVARCHAR(1000) NOT NULL,
        [newStatus] NVARCHAR(1000) NOT NULL,
        [note] NVARCHAR(1000),
        [actorId] NVARCHAR(1000) NOT NULL,
        [actorRole] NVARCHAR(1000) NOT NULL,
        [locationLat] FLOAT(53),
        [locationLng] FLOAT(53),
        [occurredAt] DATETIME2 NOT NULL,
        [createdAt] DATETIME2 NOT NULL CONSTRAINT [shipment_events_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT [shipment_events_pkey] PRIMARY KEY CLUSTERED ([id]),
        CONSTRAINT [shipment_events_eventId_key] UNIQUE NONCLUSTERED ([eventId])
    );
END;

IF OBJECT_ID(N'[dbo].[tracking_snapshots]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[tracking_snapshots] (
        [id] NVARCHAR(1000) NOT NULL,
        [trackingId] NVARCHAR(1000) NOT NULL,
        [currentStatus] NVARCHAR(1000) NOT NULL,
        [currentStatusAt] DATETIME2 NOT NULL,
        [lastEventId] NVARCHAR(1000) NOT NULL,
        [lastLocationLat] FLOAT(53),
        [lastLocationLng] FLOAT(53),
        [updatedAt] DATETIME2 NOT NULL,
        CONSTRAINT [tracking_snapshots_pkey] PRIMARY KEY CLUSTERED ([id]),
        CONSTRAINT [tracking_snapshots_trackingId_key] UNIQUE NONCLUSTERED ([trackingId]),
        CONSTRAINT [tracking_snapshots_lastEventId_key] UNIQUE NONCLUSTERED ([lastEventId])
    );
END;

IF OBJECT_ID(N'[dbo].[tracking_timeline_cache]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[tracking_timeline_cache] (
        [id] NVARCHAR(1000) NOT NULL,
        [trackingId] NVARCHAR(1000) NOT NULL,
        [eventId] NVARCHAR(1000) NOT NULL,
        [status] NVARCHAR(1000) NOT NULL,
        [occurredAt] DATETIME2 NOT NULL,
        [locationLat] FLOAT(53),
        [locationLng] FLOAT(53),
        [actorId] NVARCHAR(1000) NOT NULL,
        [actorRole] NVARCHAR(1000) NOT NULL,
        [createdAt] DATETIME2 NOT NULL CONSTRAINT [tracking_timeline_cache_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT [tracking_timeline_cache_pkey] PRIMARY KEY CLUSTERED ([id]),
        CONSTRAINT [tracking_timeline_cache_eventId_key] UNIQUE NONCLUSTERED ([eventId])
    );
END;

IF OBJECT_ID(N'[dbo].[shipment_event_outbox]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[shipment_event_outbox] (
        [id] NVARCHAR(1000) NOT NULL,
        [eventId] NVARCHAR(1000) NOT NULL,
        [topic] NVARCHAR(1000) NOT NULL,
        [partitionKey] NVARCHAR(1000) NOT NULL,
        [payload] NVARCHAR(MAX) NOT NULL,
        [status] NVARCHAR(1000) NOT NULL CONSTRAINT [shipment_event_outbox_status_df] DEFAULT 'PENDING',
        [attemptCount] INT NOT NULL CONSTRAINT [shipment_event_outbox_attemptCount_df] DEFAULT 0,
        [publishedAt] DATETIME2,
        [lastError] NVARCHAR(1000),
        [createdAt] DATETIME2 NOT NULL CONSTRAINT [shipment_event_outbox_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
        [updatedAt] DATETIME2 NOT NULL,
        CONSTRAINT [shipment_event_outbox_pkey] PRIMARY KEY CLUSTERED ([id]),
        CONSTRAINT [shipment_event_outbox_eventId_key] UNIQUE NONCLUSTERED ([eventId])
    );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'shipment_events_trackingId_occurredAt_idx' AND object_id = OBJECT_ID(N'[dbo].[shipment_events]'))
BEGIN
    CREATE NONCLUSTERED INDEX [shipment_events_trackingId_occurredAt_idx] ON [dbo].[shipment_events]([trackingId], [occurredAt]);
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'shipment_events_shipmentId_occurredAt_idx' AND object_id = OBJECT_ID(N'[dbo].[shipment_events]'))
BEGIN
    CREATE NONCLUSTERED INDEX [shipment_events_shipmentId_occurredAt_idx] ON [dbo].[shipment_events]([shipmentId], [occurredAt]);
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'tracking_timeline_cache_trackingId_occurredAt_idx' AND object_id = OBJECT_ID(N'[dbo].[tracking_timeline_cache]'))
BEGIN
    CREATE NONCLUSTERED INDEX [tracking_timeline_cache_trackingId_occurredAt_idx] ON [dbo].[tracking_timeline_cache]([trackingId], [occurredAt]);
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'tracking_snapshots_trackingId_idx' AND object_id = OBJECT_ID(N'[dbo].[tracking_snapshots]'))
BEGIN
    CREATE NONCLUSTERED INDEX [tracking_snapshots_trackingId_idx] ON [dbo].[tracking_snapshots]([trackingId]);
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'shipment_event_outbox_status_createdAt_idx' AND object_id = OBJECT_ID(N'[dbo].[shipment_event_outbox]'))
BEGIN
    CREATE NONCLUSTERED INDEX [shipment_event_outbox_status_createdAt_idx] ON [dbo].[shipment_event_outbox]([status], [createdAt]);
END;

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'shipment_events_shipmentId_fkey')
BEGIN
    ALTER TABLE [dbo].[shipment_events] ADD CONSTRAINT [shipment_events_shipmentId_fkey]
      FOREIGN KEY ([shipmentId]) REFERENCES [dbo].[Shipment]([id]) ON DELETE CASCADE ON UPDATE NO ACTION;
END;

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'shipment_events_actorId_fkey')
BEGIN
    ALTER TABLE [dbo].[shipment_events] ADD CONSTRAINT [shipment_events_actorId_fkey]
      FOREIGN KEY ([actorId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
END;

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'tracking_snapshots_trackingId_fkey')
BEGIN
    ALTER TABLE [dbo].[tracking_snapshots] ADD CONSTRAINT [tracking_snapshots_trackingId_fkey]
      FOREIGN KEY ([trackingId]) REFERENCES [dbo].[Shipment]([trackingId]) ON DELETE CASCADE ON UPDATE NO ACTION;
END;

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'tracking_snapshots_lastEventId_fkey')
BEGIN
    ALTER TABLE [dbo].[tracking_snapshots] ADD CONSTRAINT [tracking_snapshots_lastEventId_fkey]
      FOREIGN KEY ([lastEventId]) REFERENCES [dbo].[shipment_events]([eventId]) ON DELETE NO ACTION ON UPDATE NO ACTION;
END;

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'tracking_timeline_cache_trackingId_fkey')
BEGIN
    ALTER TABLE [dbo].[tracking_timeline_cache] ADD CONSTRAINT [tracking_timeline_cache_trackingId_fkey]
      FOREIGN KEY ([trackingId]) REFERENCES [dbo].[Shipment]([trackingId]) ON DELETE NO ACTION ON UPDATE NO ACTION;
END;

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'tracking_timeline_cache_eventId_fkey')
BEGIN
    ALTER TABLE [dbo].[tracking_timeline_cache] ADD CONSTRAINT [tracking_timeline_cache_eventId_fkey]
      FOREIGN KEY ([eventId]) REFERENCES [dbo].[shipment_events]([eventId]) ON DELETE NO ACTION ON UPDATE NO ACTION;
END;

IF OBJECT_ID(N'[dbo].[ShipmentEvent]', N'U') IS NOT NULL
BEGIN
    INSERT INTO [dbo].[shipment_events] (
        [id],
        [eventId],
        [shipmentId],
        [trackingId],
        [oldStatus],
        [newStatus],
        [note],
        [actorId],
        [actorRole],
        [locationLat],
        [locationLng],
        [occurredAt],
        [createdAt]
    )
    SELECT
        CONVERT(NVARCHAR(1000), NEWID()) AS [id],
        CONCAT(N'legacy-', se.[id]) AS [eventId],
        se.[shipmentId],
        s.[trackingId],
        se.[status] AS [oldStatus],
        se.[status] AS [newStatus],
        se.[note],
        se.[actorId],
        u.[role] AS [actorRole],
        NULL AS [locationLat],
        NULL AS [locationLng],
        se.[createdAt] AS [occurredAt],
        se.[createdAt]
    FROM [dbo].[ShipmentEvent] se
    INNER JOIN [dbo].[Shipment] s ON s.[id] = se.[shipmentId]
    INNER JOIN [dbo].[User] u ON u.[id] = se.[actorId]
    WHERE NOT EXISTS (
        SELECT 1 FROM [dbo].[shipment_events] nse WHERE nse.[eventId] = CONCAT(N'legacy-', se.[id])
    );
END;

INSERT INTO [dbo].[tracking_timeline_cache] (
    [id],
    [trackingId],
    [eventId],
    [status],
    [occurredAt],
    [locationLat],
    [locationLng],
    [actorId],
    [actorRole],
    [createdAt]
)
SELECT
    CONVERT(NVARCHAR(1000), NEWID()) AS [id],
    se.[trackingId],
    se.[eventId],
    se.[newStatus] AS [status],
    se.[occurredAt],
    se.[locationLat],
    se.[locationLng],
    se.[actorId],
    se.[actorRole],
    se.[createdAt]
FROM [dbo].[shipment_events] se
WHERE NOT EXISTS (
    SELECT 1 FROM [dbo].[tracking_timeline_cache] t WHERE t.[eventId] = se.[eventId]
);

WITH latest_events AS (
    SELECT
        se.[trackingId],
        se.[newStatus],
        se.[occurredAt],
        se.[eventId],
        se.[locationLat],
        se.[locationLng],
        ROW_NUMBER() OVER (
            PARTITION BY se.[trackingId]
            ORDER BY se.[occurredAt] DESC, se.[createdAt] DESC, se.[eventId] DESC
        ) AS rn
    FROM [dbo].[shipment_events] se
)
MERGE [dbo].[tracking_snapshots] AS target
USING (
    SELECT
        [trackingId],
        [newStatus],
        [occurredAt],
        [eventId],
        [locationLat],
        [locationLng]
    FROM latest_events
    WHERE rn = 1
) AS source
ON target.[trackingId] = source.[trackingId]
WHEN MATCHED THEN
    UPDATE SET
      [currentStatus] = source.[newStatus],
      [currentStatusAt] = source.[occurredAt],
      [lastEventId] = source.[eventId],
      [lastLocationLat] = source.[locationLat],
      [lastLocationLng] = source.[locationLng],
      [updatedAt] = CURRENT_TIMESTAMP
WHEN NOT MATCHED THEN
    INSERT ([id], [trackingId], [currentStatus], [currentStatusAt], [lastEventId], [lastLocationLat], [lastLocationLng], [updatedAt])
    VALUES (
      CONVERT(NVARCHAR(1000), NEWID()),
      source.[trackingId],
      source.[newStatus],
      source.[occurredAt],
      source.[eventId],
      source.[locationLat],
      source.[locationLng],
      CURRENT_TIMESTAMP
    );

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
