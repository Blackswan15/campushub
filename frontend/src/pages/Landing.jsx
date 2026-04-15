import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-50 rounded-full blur-3xl opacity-60" />
          <div className="absolute top-60 -left-20 w-72 h-72 bg-cyan-100 rounded-full blur-3xl opacity-40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-200 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-sm text-cyan-700 font-medium">Yoursampus, Centralized</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif-italic text-gray-900 mb-6 leading-tight">
            Discover{' '}
            <span className="text-cyan-500 italic">Campus Life</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            One platform for all college events — from department seminars to club competitions.
            Stop scrolling through WhatsApp groups. Start discovering what matters.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/dashboard" className="btn-primary text-base px-8 py-3">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn-primary text-base px-8 py-3">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-3">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif-italic text-center text-gray-800 mb-12">
            Everything you need, in one place
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                emoji: '🎓',
                title: 'Department Events',
                desc: 'Browse technical seminars, workshops, and academic events from every department.',
              },
              {
                emoji: '🏆',
                title: 'Club Activities',
                desc: 'Discover coding competitions, cultural shows, sports fests, and more from your clubs.',
              },
              {
                emoji: '✅',
                title: 'Easy Registration',
                desc: 'Register with one click. Track your upcoming events all in one dashboard.',
              },
            ].map((f) => (
              <div key={f.title} className="card card-hover text-center">
                <div className="text-4xl mb-4">{f.emoji}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2 font-serif-italic">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif-italic text-gray-900 mb-4">
            Ready to join?
          </h2>
          <p className="text-gray-500 mb-8">
            Create your account and start exploring campus events today.
          </p>
          <Link to="/signup" className="btn-primary text-base px-10 py-3">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} CampusHub. Built for students, by students.
      </footer>
    </div>
  );
};

export default Landing;
