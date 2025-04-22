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
    const partnerId = 'aspira-game'; // This would be your actual partner ID from Ready Player Me
    const url = `https://demo.readyplayer.me/avatar?frameApi&clearCache&projectId=${partnerId}`;
    
    // Open in a new window
    const rpmWindow = window.open(url, 'Ready Player Me', 'width=800,height=800');
    
    // Set up message listener to receive the avatar URL when done
    window.addEventListener('message', function(event) {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        // Check if the message is from Ready Player Me
        if (data.source === 'readyplayerme') {
          // If avatar export is complete
          if (data.eventName === 'v1.avatar.exported') {
            const avatarUrl = data.data.url;
            console.log('Avatar URL received:', avatarUrl);
            
            // Save the avatar URL
            setAvatarUrl(avatarUrl);
            if (updateAvatarUrl) {
              updateAvatarUrl(avatarUrl);
            }
            
            // Close the Ready Player Me window
            if (rpmWindow) {
              rpmWindow.close();
            }
          }
        }
      } catch (error) {
        console.error('Error processing Ready Player Me message:', error);
      }
    });
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
              <div className="aspect-square w-full max-w-md mx-auto bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={avatarUrl} 
                  alt="Your Ready Player Me Avatar" 
                  className="w-full h-full object-cover"
                />
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
              <Button onClick={openReadyPlayerMe}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Create Avatar
              </Button>
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
              <p className="mb-3">
                Ready Player Me is a cross-platform avatar creator that lets you create a personal
                avatar that you can use in various games and applications.
              </p>
              <p className="mb-3">
                When you click "Create Avatar", you'll be redirected to the Ready Player Me website
                where you can design your custom avatar. Once completed, your avatar will be imported
                back into Aspira.
              </p>
              <p>
                Your avatar data is stored securely and handled according to Ready Player Me's privacy policy.
              </p>
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