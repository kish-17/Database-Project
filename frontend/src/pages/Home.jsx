import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';

const Home = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('authToken');

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Community Chat</CardTitle>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2 pt-6">
          {isLoggedIn ? (
            <Button className="w-full" onClick={() => navigate('/communities')}>
              Go to Communities
            </Button>
          ) : (
            <>
              <Button className="w-full" onClick={() => navigate('/signup')}>
                Sign up
              </Button>
              <Button 
                variant="outline" 
                className="w-full border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100" 
                onClick={() => navigate('/login')}
              >
                Log in
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Home;

