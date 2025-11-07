import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  AutoFixHigh,
  Send,
  Close,
  LightbulbOutlined,
  Code,
} from '@mui/icons-material';
import api from '../services/api';
import type { AIResponse } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  timestamp: Date;
}

interface AIAssistantProps {
  open: boolean;
  onClose: () => void;
}

const AIAssistant = ({ open, onClose }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI compliance assistant. I can help you understand security findings, suggest remediation strategies, and answer questions about compliance frameworks like NIS2, ISO 27001, DORA, and RGPD. How can I help you today?',
      suggestions: [
        'What are the critical NIS2 requirements?',
        'How do I fix S3 bucket encryption issues?',
        'Explain RBAC best practices for Kubernetes',
        'Generate a remediation plan for my findings',
      ],
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (question?: string) => {
    const userQuestion = question || input.trim();
    if (!userQuestion || loading) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: userQuestion,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Get AI response
    try {
      setLoading(true);
      const response: AIResponse = await api.askAI({ question: userQuestion });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.answer,
        suggestions: response.suggestions,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error.message || 'Failed to get response'}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Conversation reset. How can I help you?',
        suggestions: [
          'What are the critical NIS2 requirements?',
          'How do I fix S3 bucket encryption issues?',
          'Explain RBAC best practices for Kubernetes',
          'Generate a remediation plan for my findings',
        ],
        timestamp: new Date(),
      },
    ]);
    setInput('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: '800px',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <AutoFixHigh color="primary" />
            <Typography variant="h6" fontWeight={600}>
              AI Compliance Assistant
            </Typography>
            <Chip label="Powered by Llama 3.1" size="small" variant="outlined" />
          </Box>
          <IconButton size="small" onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Messages */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                mb: 2,
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  maxWidth: '80%',
                  bgcolor: message.role === 'user' ? 'primary.main' : 'background.default',
                  color: message.role === 'user' ? 'primary.contrastText' : 'text.primary',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>

                {message.suggestions && message.suggestions.length > 0 && (
                  <Box mt={2}>
                    <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                      <LightbulbOutlined fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Suggested questions:
                      </Typography>
                    </Box>
                    <Box display="flex" flexDirection="column" gap={0.5}>
                      {message.suggestions.map((suggestion, idx) => (
                        <Button
                          key={idx}
                          variant="outlined"
                          size="small"
                          onClick={() => handleSend(suggestion)}
                          sx={{
                            justifyContent: 'flex-start',
                            textAlign: 'left',
                            textTransform: 'none',
                          }}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                )}

                <Typography
                  variant="caption"
                  color={message.role === 'user' ? 'primary.contrastText' : 'text.secondary'}
                  sx={{ display: 'block', mt: 1, opacity: 0.7 }}
                >
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
              </Paper>
            </Box>
          ))}

          {loading && (
            <Box display="flex" justifyContent="flex-start" mb={2}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Thinking...
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        <Divider />

        {/* Input */}
        <Box sx={{ p: 2 }}>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Ask about compliance, security findings, or best practices..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              variant="outlined"
              size="small"
            />
            <IconButton
              color="primary"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                },
              }}
            >
              <Send />
            </IconButton>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Press Enter to send, Shift+Enter for new line
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleReset} size="small">
          Reset Conversation
        </Button>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AIAssistant;
