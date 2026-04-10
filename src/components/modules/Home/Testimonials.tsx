export default function Testimonials() {
  const reviews = [
    {
      id: 1,
      name: "Alex Johnson",
      role: "Foodie",
      msg: "The best food delivery experience I've ever had. Fast, reliable, and exactly what I ordered.",
      img: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 2,
      name: "Sarah Williams",
      role: "Busy Professional",
      msg: "FoodHub saves me so much time. I love the variety of local restaurants I can choose from.",
      img: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 3,
      name: "Michael Brown",
      role: "Local Chef",
      msg: "As a provider, the platform brings me consistent orders and the dashboard is incredibly easy to use.",
      img: "https://randomuser.me/api/portraits/men/68.jpg"
    }
  ];

  return (
    <div className="py-20 bg-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">What Our Users Say</h2>
        <p className="text-lg text-gray-600 mb-12">Don't just take our word for it.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white rounded-2xl p-8 shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center">
                <img 
                  src={rev.img} 
                  alt={rev.name} 
                  className="w-20 h-20 rounded-full mb-4 shadow-sm border-2 border-orange-200"
                />
                <h3 className="font-bold text-lg text-gray-900">{rev.name}</h3>
                <span className="text-sm text-orange-600 font-medium mb-4">{rev.role}</span>
                <p className="text-gray-600 italic">"{rev.msg}"</p>
                <div className="flex text-yellow-400 mt-4 space-x-1">
                  {[1,2,3,4,5].map(star => (
                    <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}