import heroImage from '@/assets/hero-illustration.jpg';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-background to-muted-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Digitalize your visitor registration
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Transform how museums, cultural centers, and events manage visitors with our secure, cloud-based registration platform.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-medium"
              >
                Start for Free
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-card-border hover:bg-accent"
              >
                Watch Demo
              </Button>
            </div>
            
            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>No credit card required</span>
              </div>
            </div>
          </div>
          
          <div className="lg:pl-8">
            <img 
              src={heroImage.src} 
              alt="People using tablets for visitor registration" 
              className="w-full h-auto rounded-2xl shadow-large"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;