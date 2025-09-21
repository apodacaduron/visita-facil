import { Star } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Dr. Maria González",
      title: "Director, Museum of Contemporary Art",
      content: "VisitaFácil transformed our visitor experience completely. The check-in process is now seamless, and the analytics help us understand our audience better than ever before.",
      rating: 5
    },
    {
      name: "Prof. Carlos Mendoza",
      title: "Events Coordinator, Universidad Nacional",
      content: "We've been using VisitaFácil for all our academic events. The system is incredibly reliable and the support team is always responsive when we need help.",
      rating: 5
    },
    {
      name: "Ana Patricia Silva",
      title: "Cultural Center Manager",
      content: "The reporting features are outstanding. We can now track visitor patterns and optimize our exhibitions based on real data. Highly recommended!",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-muted-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Trusted by Leading Institutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what our customers say about their experience with VisitaFácil.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card border-card-border shadow-soft hover:shadow-medium transition-shadow">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="border-t border-card-border pt-4">
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.title}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;