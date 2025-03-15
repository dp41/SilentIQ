'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const { toast } = useToast();

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      setValue('acceptMessages', response.data.isAcceptingMessage);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
            axiosError.response?.data.message ??
            'Failed to fetch message settings',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(
      async (refresh: boolean = false) => {
        setIsLoading(true);
        setIsSwitchLoading(false);
        try {
          const response = await axios.get<ApiResponse>('/api/getMessages');
          setMessages(response.data.messages || []);

          if (refresh) {
            toast({
              title: 'Refreshed Messages',
              description: 'Showing latest messages',
            });
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          toast({
            title: 'Error',
            description:
                axiosError.response?.data.message ?? 'Failed to fetch messages',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
          setIsSwitchLoading(false);
        }
      },
      [setIsLoading, setMessages, toast]
  );

  useEffect(() => {
    if (!session || !session.user) return;

    fetchMessages();
    fetchAcceptMessages();
  }, [session, setValue, toast, fetchAcceptMessages, fetchMessages]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      });
      setValue('acceptMessages', !acceptMessages);
      toast({
        title: response.data.message,
        variant: 'default',
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
            axiosError.response?.data.message ??
            'Failed to update message settings',
        variant: 'destructive',
      });
    }
  };

  if (!session || !session.user) {
    return <div></div>;
  }
  const { username } = session.user as User;

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'URL Copied!',
      description: 'Profile URL has been copied to clipboard.',
    });
  };
  const sentimentCounts: Record<string, number> = {
    Positive: 0,
    Neutral: 0,
    Negative: 0,
  };

  const languageCounts: Record<string, number> = {};

  messages.forEach((message) => {
    if (sentimentCounts[message.sentiment] !== undefined) {
      sentimentCounts[message.sentiment]++;
    }
    if (message.language) {
      languageCounts[message.language] = (languageCounts[message.language] || 0) + 1;
    }
  });

  const chartData = {
    labels: Object.keys(sentimentCounts),
    datasets: [
      {
        label: 'Sentiments',
        data: Object.values(sentimentCounts),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  const languageChartData = {
    labels: Object.keys(languageCounts),
    datasets: [
      {
        label: 'Languages',
        data: Object.values(languageCounts),
        backgroundColor: 'rgba(102,158,255,0.5)',
      },
    ],
  };

  return (
      <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
        <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
          <div className="flex items-center">
            <input
                type="text"
                value={profileUrl}
                disabled
                className="input input-bordered w-full p-2 mr-2"
            />
            <Button className='md: mr-7' onClick={copyToClipboard}>Copy</Button>
          </div>
        </div>

        <div className="mb-4">
          <Switch
              {...register('acceptMessages')}
              checked={acceptMessages}
              onCheckedChange={handleSwitchChange}
              disabled={isSwitchLoading}
          />
          <span className="ml-2">
          Accept Messages: {acceptMessages ? 'On' : 'Off'}
        </span>
        </div>
        <Separator />

        <Button
            className="mt-4"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              fetchMessages(true);
            }}
        >
          {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
              <RefreshCcw className="h-4 w-4" />
          )}
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          <div className="bg-gray-100 p-4 rounded-lg max-h-72">
            <Line data={chartData} />
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <Bar data={languageChartData} />
          </div>
          <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
            {messages.length > 0 ? (
                messages.map((message) => (
                    <MessageCard
                        key={message._id as string}
                        message={message}
                        onMessageDelete={handleDeleteMessage}
                    />
                ))
            ) : (
                <p>No messages to display.</p>
            )}
          </div>
        </div>
      </div>
  );
}

export default UserDashboard;
