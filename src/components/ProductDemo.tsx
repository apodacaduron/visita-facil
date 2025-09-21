import dashboardMockup from '@/assets/admin-dashboard-mockup.jpg';
import registrationMockup from '@/assets/registration-form-mockup.jpg';

const ProductDemo = () => {
  return (
    <section className="py-20 bg-muted-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            See VisitaFácil in Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From visitor registration to comprehensive analytics, experience the complete solution.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="bg-card p-8 rounded-2xl shadow-medium border border-card-border">
              <img 
                src={registrationMockup.src} 
                alt="Visitor registration form interface" 
                className="w-full h-auto rounded-lg shadow-soft"
              />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-foreground">
                Visitor Registration Form
              </h3>
              <p className="text-muted-foreground">
                Intuitive tablet-friendly interface that visitors can complete quickly and easily. Customizable fields for different types of institutions and events.
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-card p-8 rounded-2xl shadow-medium border border-card-border">
              <img 
                src={dashboardMockup.src} 
                alt="Admin dashboard interface" 
                className="w-full h-auto rounded-lg shadow-soft"
              />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-foreground">
                Admin Dashboard
              </h3>
              <p className="text-muted-foreground">
                Comprehensive dashboard with real-time visitor analytics, export capabilities, and detailed reporting tools for institutional insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDemo;