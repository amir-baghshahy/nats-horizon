import { useEffect, useState, useRef } from 'react'

interface WebSocketMessage {
  type: 'stream:update' | 'consumer:update' | 'connection:update' | 'metric:update' | 'alert'
  data: any
  timestamp: number
}

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket(url)
        wsRef.current = ws

        ws.onopen = () => {
          setIsConnected(true)
          console.log('WebSocket connected')
        }

        ws.onmessage = (event) => {
          const message: WebSocketMessage = JSON.parse(event.data)
          setLastMessage(message)
          setMessages(prev => [...prev.slice(-99), message]) // Keep last 100 messages
        }

        ws.onclose = () => {
          setIsConnected(false)
          console.log('WebSocket disconnected, reconnecting in 3s...')
          reconnectTimeoutRef.current = setTimeout(connect, 3000)
        }

        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
        }
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error)
        reconnectTimeoutRef.current = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [url])

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }

  return {
    isConnected,
    lastMessage,
    messages,
    sendMessage,
  }
}

// Hook for stream-specific updates
export function useStreamUpdates(streamName: string) {
  const [streamData, setStreamData] = useState<any>(null)
  const ws = useWebSocket(`ws://localhost:3000/ws?stream=${streamName}`)

  useEffect(() => {
    if (ws.lastMessage?.type === 'stream:update' && ws.lastMessage.data?.name === streamName) {
      setStreamData(ws.lastMessage.data)
    }
  }, [ws.lastMessage, streamName])

  return {
    isConnected: ws.isConnected,
    streamData,
  }
}

// Hook for consumer-specific updates
export function useConsumerUpdates(consumerName: string) {
  const [consumerData, setConsumerData] = useState<any>(null)
  const ws = useWebSocket(`ws://localhost:3000/ws?consumer=${consumerName}`)

  useEffect(() => {
    if (ws.lastMessage?.type === 'consumer:update' && ws.lastMessage.data?.name === consumerName) {
      setConsumerData(ws.lastMessage.data)
    }
  }, [ws.lastMessage, consumerName])

  return {
    isConnected: ws.isConnected,
    consumerData,
  }
}

// Hook for global metrics
export function useMetrics() {
  const [metrics, setMetrics] = useState({
    messagesPerSecond: 0,
    bytesPerSecond: 0,
    connections: 0,
    activeConsumers: 0,
  })
  const ws = useWebSocket('ws://localhost:3000/ws?metrics=true')

  useEffect(() => {
    if (ws.lastMessage?.type === 'metric:update') {
      setMetrics(ws.lastMessage.data)
    }
  }, [ws.lastMessage])

  return {
    isConnected: ws.isConnected,
    metrics,
  }
}
