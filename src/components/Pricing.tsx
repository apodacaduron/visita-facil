import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for small museums and cultural centers",
      features: [
        "Up to 100 visitors/month",
        "Basic registration form",
        "Email support",
        "Data export (CSV)",
        "1 user account"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Basic",
      price: "$29",
      period: "per month",
      description: "Ideal for growing institutions",
      features: [
        "Up to 1,000 visitors/month",
        "Custom registration forms",
        "Priority email support",
        "Advanced analytics",
        "Up to 3 user accounts",
        "API access"
      ],
      cta: "Choose Basic",
      popular: true
    },
    {
      name: "Pro",
      price: "$99",
      period: "per month",
      description: "For large institutions and events",
      features: [
        "Unlimited visitors",
        "Advanced customization",
        "24/7 phone support",
        "White-label solution",
        "Unlimited user accounts",
        "Advanced integrations",
        "Custom reporting"
      ],
      cta: "Choose Pro",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your institution&apos;s needs. Start free and upgrade as you grow.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative bg-card border-card-border shadow-soft hover:shadow-medium transition-all ${
                plan.popular ? 'ring-2 ring-primary shadow-large scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-primary hover:bg-primary-hover text-primary-foreground' 
                      : 'bg-secondary hover:bg-secondary-hover text-secondary-foreground'
                  }`}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            All plans include SSL encryption, GDPR compliance, and regular backups.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;