import axios from 'axios'

/**
 * Reset consumer lag by advancing the consumer to a specific sequence
 */
export async function resetConsumerLag(
  streamName: string,
  consumerName: string,
  targetSequence?: number
): Promise<{ success: boolean; message: string; newSequence?: number }> {
  try {
    const payload = targetSequence !== undefined ? { sequence: targetSequence } : {}
    const response = await axios.post(
      `/api/streams/${encodeURIComponent(streamName)}/consumers/${encodeURIComponent(consumerName)}/lag-reset`,
      payload
    )
    return {
      success: true,
      message: 'Lag reset successfully',
      newSequence: response.data?.new_sequence,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to reset lag',
    }
  }
}

/**
 * Replay messages from a stream to a consumer
 */
export async function replayMessages(
  streamName: string,
  consumerName: string,
  options: {
    startSequence?: number
    endSequence?: number
    startTime?: Date
    endTime?: Date
    filter?: string
  } = {}
): Promise<{ success: boolean; message: string; replayId?: string }> {
  try {
    const payload: any = {}

    if (options.startSequence) payload.start_seq = options.startSequence
    if (options.endSequence) payload.end_seq = options.endSequence
    if (options.startTime) payload.start_time = options.startTime.toISOString()
    if (options.endTime) payload.end_time = options.endTime.toISOString()
    if (options.filter) payload.filter = options.filter

    const response = await axios.post(
      `/api/streams/${encodeURIComponent(streamName)}/consumers/${encodeURIComponent(consumerName)}/replay`,
      payload
    )
    return {
      success: true,
      message: 'Message replay started',
      replayId: response.data?.replay_id,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to start replay',
    }
  }
}

/**
 * Delete a specific message from a stream
 */
export async function deleteMessage(
  streamName: string,
  sequence: number
): Promise<{ success: boolean; message: string }> {
  try {
    await axios.delete(
      `/api/streams/${encodeURIComponent(streamName)}/messages/${sequence}`
    )
    return {
      success: true,
      message: `Message ${sequence} deleted successfully`,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to delete message',
    }
  }
}

/**
 * Purge all messages from a stream (with optional filter)
 */
export async function purgeStream(
  streamName: string,
  filter?: {
    subject?: string
    sequence?: number
  }
): Promise<{ success: boolean; message: string; purgedCount?: number }> {
  try {
    const payload = filter || {}
    const response = await axios.post(
      `/api/streams/${encodeURIComponent(streamName)}/purge`,
      payload
    )
    return {
      success: true,
      message: 'Stream purged successfully',
      purgedCount: response.data?.purged_count,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to purge stream',
    }
  }
}

/**
 * Delete a consumer
 */
export async function deleteConsumer(
  streamName: string,
  consumerName: string
): Promise<{ success: boolean; message: string }> {
  try {
    await axios.delete(
      `/api/streams/${encodeURIComponent(streamName)}/consumers/${encodeURIComponent(consumerName)}`
    )
    return {
      success: true,
      message: `Consumer ${consumerName} deleted successfully`,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to delete consumer',
    }
  }
}

/**
 * Pause/Resume a consumer
 */
export async function setConsumerState(
  streamName: string,
  consumerName: string,
  paused: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    const endpoint = paused
      ? `/api/streams/${encodeURIComponent(streamName)}/consumers/${encodeURIComponent(consumerName)}/pause`
      : `/api/streams/${encodeURIComponent(streamName)}/consumers/${encodeURIComponent(consumerName)}/resume`

    await axios.post(endpoint)
    return {
      success: true,
      message: paused ? 'Consumer paused' : 'Consumer resumed',
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to update consumer state',
    }
  }
}

/**
 * Terminate a connection
 */
export async function terminateConnection(
  connectionId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await axios.delete(`/api/connections/${encodeURIComponent(connectionId)}`)
    return {
      success: true,
      message: 'Connection terminated successfully',
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to terminate connection',
    }
  }
}

/**
 * Delete a stream
 */
export async function deleteStream(
  streamName: string
): Promise<{ success: boolean; message: string }> {
  try {
    await axios.delete(`/api/streams/${encodeURIComponent(streamName)}`)
    return {
      success: true,
      message: `Stream ${streamName} deleted successfully`,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to delete stream',
    }
  }
}

/**
 * Update stream configuration
 */
export async function updateStreamConfig(
  streamName: string,
  config: {
    subjects?: string[]
    retention?: string
    max_age?: number
    max_bytes?: number
    max_msg_size?: number
    replicas?: number
    storage?: string
  }
): Promise<{ success: boolean; message: string }> {
  try {
    await axios.put(`/api/streams/${encodeURIComponent(streamName)}`, config)
    return {
      success: true,
      message: 'Stream configuration updated successfully',
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.error || 'Failed to update stream configuration',
    }
  }
}
