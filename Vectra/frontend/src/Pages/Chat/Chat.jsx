
import React, { useCallback, useEffect, useState } from 'react'
import { API_BASE } from '../../config'
import { AccountDetails } from './Components/AccountDetails'
import ChatManager from './Components/ChatManager'
import { ChatFlow } from './Components/ChatFlow'

// export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const Chat = () => {
  const [activeConversation, setActiveConversation] = useState(null)
  const [credentials, setCredentials] = useState([])
  const [credentialId, setCredentialId] = useState('')
  const [models, setModels] = useState([])
  const [modelId, setModelId] = useState('')
  const [loadingCredentials, setLoadingCredentials] = useState(true)
  const [loadingModels, setLoadingModels] = useState(false)
  const [error, setError] = useState('')

  // Load registered credentials.
  useEffect(() => {
    const controller = new AbortController()

    const loadCredentials = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/credentials`, {
          signal: controller.signal,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || data.error || 'Failed to load credentials.')
        }

        const list = Array.isArray(data) ? data : []
        setCredentials(list)

        if (list.length > 0) {
          setCredentialId(list[0].id)
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Could not connect to the backend.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingCredentials(false)
        }
      }
    }

    loadCredentials()
    return () => controller.abort()
  }, [])

  // Load models for the selected credential.
  useEffect(() => {
    if (!credentialId) {
      setModels([])
      setModelId('')
      return
    }

    const controller = new AbortController()

    const loadModels = async () => {
      setLoadingModels(true)
      setError('')

      try {
        const response = await fetch(
          `${API_BASE}/api/credentials/${encodeURIComponent(credentialId)}/models`,
          { signal: controller.signal },
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || data.error || 'Failed to load models.')
        }

        const list = Array.isArray(data) ? data : []
        setModels(list)

        const getId = (model) =>
          typeof model === 'string'
            ? model
            : model?.id ?? model?.modelId ?? model?.model_id ?? model?.name ?? ''

        setModelId((current) =>
          list.some((model) => getId(model) === current)
            ? current
            : getId(list[0]),
        )
      } catch (err) {
        if (err.name !== 'AbortError') {
          setModels([])
          setModelId('')
          setError(err.message || 'Could not load models.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingModels(false)
        }
      }
    }

    loadModels()
    return () => controller.abort()
  }, [credentialId])

  const startNewConversation = useCallback(() => {
    setError('')
    setActiveConversation({
      id: `draft-${Date.now()}`,
      title: 'New conversation',
      subtitle: 'Ready to chat',
      persisted: false,
    })
  }, [])

  const handleSelectConversation = useCallback((conversation) => {
    setError('')
    setActiveConversation(conversation)
  }, [])

  // This is called after the backend successfully creates/saves a conversation.
  const handleConversationSaved = useCallback((conversation) => {
    setActiveConversation(conversation)
  }, [])

  const sendMessage = useCallback(
    async (message, conversation) => {
      if (!credentialId) {
        throw new Error('Please register and select an API credential.')
      }

      if (!modelId) {
        throw new Error('Please select a model.')
      }

      const body = {
        credentialId,
        modelId,
        message,
      }

      // Drafts have no backend ID yet.
      if (conversation?.persisted && conversation.id) {
        body.conversationId = conversation.id
      }

      const response = await fetch(`${API_BASE}/api/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || data.error || `Request failed (${response.status}).`,
        )
      }

      const providerName =
        credentials.find((item) => item.id === credentialId)?.providerName ||
        'Provider'

      const savedConversation = {
        ...conversation,
        id: data.conversationId,
        title:
          conversation?.title === 'New conversation'
            ? message.slice(0, 45) + (message.length > 45 ? '…' : '')
            : conversation?.title || message.slice(0, 45),
        subtitle: `${providerName} · ${modelId}`,
        persisted: true,
      }

      handleConversationSaved(savedConversation)

      return {
        reply: data.response ?? data.providerResponse?.content ?? '',
        conversation: savedConversation,
        conversationId: data.conversationId,
        providerResponse: data.providerResponse,
      }
    },
    [credentialId, modelId, credentials, handleConversationSaved],
  )

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#1D1F2B] text-white">
      <AccountDetails className="w-[12.5%] shrink-0" />

      <ChatManager
        className="w-[25%] shrink-0"
        activeConversation={activeConversation}
        onSelectConversation={handleSelectConversation}
        onNewConversation={startNewConversation}
      />

      <main className="min-w-0 flex-1 overflow-hidden">
        <ChatFlow
          className="h-full w-full"
          conversation={activeConversation}
          credentials={credentials}
          credentialId={credentialId}
          onCredentialChange={setCredentialId}
          models={models}
          modelId={modelId}
          onModelChange={setModelId}
          loadingCredentials={loadingCredentials}
          loadingModels={loadingModels}
          error={error}
          onSendMessage={sendMessage}
          onConversationSaved={handleConversationSaved}
        />
      </main>
    </div>
  )
}

export default Chat
