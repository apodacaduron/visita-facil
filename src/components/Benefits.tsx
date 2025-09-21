import { BarChart3, Clock, Shield } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

const Benefits = () => {
  const benefits = [
    {
      icon: Clock,
      title: "Save Time",
      description: "Streamline visitor check-in process with digital forms that reduce waiting times and eliminate paperwork."
    },
    {
      icon: Shield,
      title: "Secure Cloud Storage",
      description: "All visitor data is encrypted and stored securely in the cloud with GDPR compliance and automatic backups."
    },
    {
      icon: BarChart3,
      title: "Automatic Reports",
      description: "Generate detailed analytics and reports about visitor patterns, peak times, and demographic insights."
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Why Choose VisitaFácil?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Modern solutions for modern institutions. Simplify visitor management while enhancing security and insights.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <Card key={index} className="bg-card border-card-border shadow-soft hover:shadow-medium transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="size-12 text-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Benefits;