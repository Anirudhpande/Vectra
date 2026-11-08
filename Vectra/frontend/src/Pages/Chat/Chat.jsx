
import React, { useCallback, useEffect, useState } from 'react'
import { API_BASE } from '../../config'
import { getCsrfHeaders } from '../../lib/csrf'

import ChatManager from './Components/ChatManager'
import ChatFlow from './Components/ChatFlow'

const Chat = () => {
  const [activeConversation, setActiveConversation] = useState(null)

  const [credentials, setCredentials] = useState([])
  const [credentialId, setCredentialId] = useState('')

  const [models, setModels] = useState([])
  const [modelId, setModelId] = useState('')

  const [loadingCredentials, setLoadingCredentials] = useState(true)
  const [loadingModels, setLoadingModels] = useState(false)
  const [error, setError] = useState('')

  // Load saved API credentials
  useEffect(() => {
    const controller = new AbortController()

    const loadCredentials = async () => {
      try {
        setLoadingCredentials(true)
        setError('')

        const response = await fetch(`${API_BASE}/api/credentials`, {
          credentials: 'include',
          signal: controller.signal,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || data.error || 'Failed to load credentials.',
          )
        }

        const list = Array.isArray(data) ? data : []

        setCredentials(list)

        if (list.length > 0) {
          setCredentialId(list[0].id)
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Could not load credentials.')
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

  // Load models whenever the selected credential changes
  useEffect(() => {
    if (!credentialId) {
      setModels([])
      setModelId('')
      return
    }

    const controller = new AbortController()

    const loadModels = async () => {
      try {
        setLoadingModels(true)
        setModels([])
        setModelId('')
        setError('')

        const response = await fetch(
          `${API_BASE}/api/credentials/${encodeURIComponent(credentialId)}/models`,
          {
            credentials: 'include',
            signal: controller.signal,
          },
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.message || data.error || 'Failed to load models.',
          )
        }

        const list = Array.isArray(data) ? data : []

        setModels(list)

        if (list.length > 0) {
          const firstModel = list[0]

          const firstModelId =
            typeof firstModel === 'string'
              ? firstModel
              : firstModel.id ??
                firstModel.modelId ??
                firstModel.model_id ??
                firstModel.name ??
                ''

          setModelId(firstModelId)
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
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

  // Start a new unsaved conversation
  const startNewConversation = useCallback(() => {
    setActiveConversation({
      id: `draft-${Date.now()}`,
      title: 'New conversation',
      subtitle: 'Ready to chat',
      persisted: false,
    })

    setError('')
  }, [])

  // Select an existing conversation
  const selectConversation = useCallback((conversation) => {
    setActiveConversation(conversation)
    setError('')
  }, [])

  // Update the active conversation after its first message is saved
  const saveConversation = useCallback((conversation) => {
    setActiveConversation(conversation)
  }, [])

  // Send a message to the backend
  const sendMessage = useCallback(
    async (message, conversation) => {
      if (!credentialId || !modelId) {
        throw new Error('Select an API credential and model first.')
      }

      const requestBody = {
        credentialId,
        modelId,
        message,
      }

      if (conversation?.persisted) {
        requestBody.conversationId = conversation.id
      }

      const csrfHeaders = await getCsrfHeaders()

      const response = await fetch(`${API_BASE}/api/chats`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...csrfHeaders,
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Failed to send message.',
        )
      }

      const providerResponse = data.providerResponse || {}

      const conversationId =
        data.conversationId ||
        data.conversation?.id ||
        conversation?.id

      const savedConversation = {
        ...conversation,
        ...(data.conversation || {}),
        id: conversationId,
        title:
          data.title ||
          data.conversation?.title ||
          conversation?.title ||
          'New conversation',
        subtitle: `${
          credentials.find((item) => item.id === credentialId)?.providerName ||
          'AI'
        } · ${modelId}`,
        persisted: true,
      }

      return {
        ...data,
        conversation: savedConversation,
        reply:
          data.response ||
          data.reply ||
          data.content ||
          providerResponse.content ||
          '',
        providerResponse,
      }
    },
    [credentialId, modelId, credentials],
  )

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black text-white">

      {/* CONVERSATIONS SIDEBAR */}
      <aside className="h-full w-[300px] shrink-0 border-r border-white/[0.08]">
        <ChatManager
          className="h-full w-full"
          activeConversation={activeConversation}
          onNewConversation={startNewConversation}
          onSelectConversation={selectConversation}
        />
      </aside>

      {/* CHAT WORKSPACE */}
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
          onConversationSaved={saveConversation}
        />
      </main>
    </div>
  )
}

export default Chat
