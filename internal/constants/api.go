package constants

import "time"

const (
	APIStreamList   = "$JS.API.STREAM.LIST"
	APIStreamInfo   = "$JS.API.STREAM.INFO"
	APIStreamCreate = "$JS.API.STREAM.CREATE"
	APIStreamUpdate = "$JS.API.STREAM.UPDATE"
	APIStreamDelete = "$JS.API.STREAM.DELETE"
	APIStreamPurge  = "$JS.API.STREAM.PURGE"

	APIConsumerList   = "$JS.API.CONSUMER.LIST"
	APIConsumerInfo   = "$JS.API.CONSUMER.INFO"
	APIConsumerCreate = "$JS.API.CONSUMER.CREATE"
	APIConsumerUpdate = "$JS.API.CONSUMER.UPDATE"
	APIConsumerDelete = "$JS.API.CONSUMER.DURABLE.DELETE"

	APIConsumerListPaged = "$JS.API.CONSUMER.LIST."

	JSServerPing  = "$JS.API.SERVER.PING"
	JSAccountInfo = "$JS.API.ACCOUNT.INFO"

	SysServerPing      = "$SYS.REQ.SERVER.PING"
	SysServerPingConnz = "$SYS.REQ.SERVER.PING.CONNZ"
	SysServerPingVarz  = "$SYS.REQ.SERVER.PING.VARZ"

	SysClusterInfo = "$SYS.CLUSTER.INFO"
)

const (
	SSEKeepaliveInterval time.Duration = 30 * time.Second
	SSEStatsInterval     time.Duration = 5 * time.Second
)
