import React, { useState, useEffect } from 'react';
import { useCharacter } from '../lib/stores/useCharacter';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogHeader, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from './ui/alert-dialog';
import { Info, User, ChevronLeft, ExternalLink } from 'lucide-react';

interface ReadyPlayerMeAvatarProps {
  onBack?: () => void;
}

export function ReadyPlayerMeAvatar({ onBack }: ReadyPlayerMeAvatarProps) {
  const navigate = useNavigate();
  const { avatarUrl: storedAvatarUrl, updateAvatarUrl } = useCharacter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(storedAvatarUrl);
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  
  // Function to open Ready Player Me in a new tab/window
  const openReadyPlayerMe = () => {
    // Using RPM's quick integration approach
    // For the demo, we're just using the public Demo version
    // In production, you would register a partner ID
    const url = `https://demo.readyplayer.me/avatar?frameApi`;
    
    // Open in a new window with more permissions
    const rpmWindow = window.open(url, 'ReadyPlayerMe', 'width=800,height=800');
    
    // Set up a general message event handler
    const handleMessage = (event: MessageEvent) => {
      try {
        // Log all incoming messages for debugging
        console.log('Received message:', event);
        
        // Parse the data if it's a string
        let data;
        if (typeof event.data === 'string') {
          try {
            data = JSON.parse(event.data);
          } catch (e) {
            // If it's not JSON, use the raw string
            data = { rawMessage: event.data };
          }
        } else {
          data = event.data;
        }
        
        console.log('Processed message data:', data);
        
        // Check for RPM messages with more flexibility
        if (data && (data.source === 'readyplayerme' || 
                    (typeof data.rawMessage === 'string' && 
                     data.rawMessage.includes('readyplayerme')))) {
                       
          // If we have a URL in the message or data
          if (data.url || (data.data && data.data.url)) {
            const avatarUrl = data.url || data.data.url;
            console.log('Avatar URL extracted:', avatarUrl);
            
            // Save the avatar URL
            setAvatarUrl(avatarUrl);
            updateAvatarUrl(avatarUrl);
            
            // Close the window if still open
            if (rpmWindow && !rpmWindow.closed) {
              rpmWindow.close();
            }
            
            // Remove this event listener once we've processed the URL
            window.removeEventListener('message', handleMessage);
          }
          
          // Also check specific event names
          else if (data.eventName === 'v1.avatar.exported' && data.data && data.data.url) {
            const avatarUrl = data.data.url;
            console.log('Avatar URL from export event:', avatarUrl);
            
            // Save the avatar URL
            setAvatarUrl(avatarUrl);
            updateAvatarUrl(avatarUrl);
            
            // Close the window if still open
            if (rpmWindow && !rpmWindow.closed) {
              rpmWindow.close();
            }
            
            // Remove this event listener once we've processed the URL
            window.removeEventListener('message', handleMessage);
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };
    
    // Add the event listener
    window.addEventListener('message', handleMessage);
    
    // Also set a periodic check to see if the window was closed and the URL might have been provided differently
    const checkInterval = setInterval(() => {
      if (rpmWindow && rpmWindow.closed) {
        // Window was closed without sending a message
        console.log('RPM window was closed');
        clearInterval(checkInterval);
        window.removeEventListener('message', handleMessage);
      }
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl flex items-center">
              <User className="h-5 w-5 mr-2 text-primary" />
              Ready Player Me Avatar
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowInfoDialog(true)}>
              <Info className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Create a fully customizable 3D avatar that reflects your personality
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {avatarUrl ? (
            <div className="space-y-4">
              <div className="aspect-square w-full max-w-md mx-auto bg-gray-100 rounded-lg overflow-hidden">
                <AvatarPreview url={avatarUrl} className="w-full h-full" />
              </div>
              <div className="flex justify-center space-x-3">
                <Button onClick={openReadyPlayerMe}>
                  Edit Avatar
                </Button>
                <Button variant="outline" onClick={() => {
                  setAvatarUrl(null);
                  updateAvatarUrl(null);
                }}>
                  Remove Avatar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 bg-muted/50 rounded-lg">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-2">No Custom Avatar Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your personalized 3D avatar with Ready Player Me's advanced avatar creator
              </p>
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col gap-2">
                  <Button onClick={openReadyPlayerMe} className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Create Avatar (Popup)
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('https://demo.readyplayer.me/avatar', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Create Avatar (New Tab)
                  </Button>
                </div>
                <div className="text-xs text-center text-muted-foreground">
                  Or if you already have a Ready Player Me avatar
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    placeholder="Paste avatar URL here..." 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    onChange={(e) => {
                      const url = e.target.value.trim();
                      if (url.includes('readyplayer.me') && url.endsWith('.glb')) {
                        setAvatarUrl(url);
                        updateAvatarUrl(url);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {onBack && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={onBack}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
        </CardContent>
      </Card>
      
      {/* Information Dialog */}
      <AlertDialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>About Ready Player Me</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="mb-3">
                Ready Player Me is a cross-platform avatar creator that lets you create a personal
                avatar that you can use in various games and applications.
              </div>
              <div className="mb-3">
                When you click "Create Avatar", you'll be redirected to the Ready Player Me website
                where you can design your custom avatar. Once completed, your avatar will be imported
                back into Aspira.
              </div>
              <div className="mb-3">
                <strong>Alternative Method:</strong> If the automatic import doesn't work, you can
                manually copy your avatar URL from Ready Player Me and paste it into the input field.
              </div>
              <div>
                Your avatar data is stored securely and handled according to Ready Player Me's privacy policy.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={openReadyPlayerMe}>
              Create Avatar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ReadyPlayerMeAvatar;