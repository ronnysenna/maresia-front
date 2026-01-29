'use client';

import Image from 'next/image';
import Link from 'next/link';
import { 
  BedDouble, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Wifi, 
  Car, 
  Coffee,
  Waves,
  Sun,
  Calendar,
  ChevronRight,
  Instagram,
  Facebook
} from 'lucide-react';

const amenities = [
  { icon: Wifi, label: 'Wi-Fi Grátis' },
  { icon: Car, label: 'Estacionamento' },
  { icon: Coffee, label: 'Café da Manhã' },
  { icon: Waves, label: 'Piscina' },
  { icon: Sun, label: 'Área de Lazer' },
  { icon: BedDouble, label: 'Quartos Confortáveis' },
];

const roomTypes = [
  {
    type: 'Standard',
    description: 'Conforto essencial para sua estadia',
    capacity: 2,
    price: 250,
    image: '/rooms/standard.jpg',
  },
  {
    type: 'Luxo',
    description: 'Espaço amplo com vista privilegiada',
    capacity: 3,
    price: 450,
    image: '/rooms/luxo.jpg',
  },
  {
    type: 'Master',
    description: 'Suíte premium com todas as comodidades',
    capacity: 4,
    price: 650,
    image: '/rooms/master.jpg',
  },
];

const testimonials = [
  {
    name: 'Maria Silva',
    text: 'Lugar incrível! Atendimento impecável e quartos muito confortáveis. Voltarei com certeza!',
    rating: 5,
  },
  {
    name: 'João Santos',
    text: 'A melhor pousada da região. Café da manhã maravilhoso e localização perfeita.',
    rating: 5,
  },
  {
    name: 'Ana Costa',
    text: 'Experiência única! Equipe muito atenciosa e infraestrutura de primeira.',
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Pousada Maresia</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#sobre" className="text-gray-600 hover:text-blue-600 transition-colors">Sobre</a>
              <a href="#quartos" className="text-gray-600 hover:text-blue-600 transition-colors">Quartos</a>
              <a href="#comodidades" className="text-gray-600 hover:text-blue-600 transition-colors">Comodidades</a>
              <a href="#contato" className="text-gray-600 hover:text-blue-600 transition-colors">Contato</a>
            </nav>

            <div className="flex items-center gap-4">
              <Link 
                href="/login"
                className="hidden sm:block text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Área Restrita
              </Link>
              <Link 
                href="/reservar"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Reservar Agora
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/70">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: "url('/hero-beach.jpg')" }}
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Seu refúgio à 
              <span className="text-blue-300"> beira-mar</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Descubra o paraíso na Pousada Maresia. Quartos confortáveis, 
              atendimento excepcional e a melhor localização para suas férias dos sonhos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/reservar"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-lg"
              >
                <Calendar className="w-5 h-5" />
                Fazer Reserva
              </Link>
              <a 
                href="#quartos"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-lg"
              >
                Ver Quartos
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">10+</p>
                <p className="text-gray-600 text-sm">Anos de Experiência</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">5</p>
                <p className="text-gray-600 text-sm">Quartos Disponíveis</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">1000+</p>
                <p className="text-gray-600 text-sm">Hóspedes Satisfeitos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">4.9</p>
                <p className="text-gray-600 text-sm">Avaliação Média</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="pt-32 pb-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Bem-vindo à <span className="text-blue-600">Pousada Maresia</span>
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Localizada em um dos pontos mais privilegiados do litoral, a Pousada Maresia 
                oferece uma experiência única de hospedagem. Com mais de 10 anos de tradição, 
                combinamos o conforto de casa com o requinte de um hotel boutique.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Nossos quartos foram cuidadosamente projetados para proporcionar o máximo 
                de conforto, com vista para o mar ou para nossos jardins tropicais. 
                Venha viver momentos inesquecíveis conosco.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                      <Star className="w-4 h-4 text-blue-600" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">4.9 de 5 estrelas</p>
                  <p className="text-sm text-gray-500">Baseado em 500+ avaliações</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] bg-blue-200 rounded-2xl overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <Waves className="w-24 h-24 text-white/50" />
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <p className="text-2xl font-bold text-blue-600">Desde 2014</p>
                <p className="text-gray-600 text-sm">Realizando sonhos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="quartos" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nossos Quartos
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Escolha o quarto ideal para sua estadia. Todos equipados com ar-condicionado, 
              TV, frigobar e Wi-Fi gratuito.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {roomTypes.map((room) => (
              <div key={room.type} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-400 to-blue-600 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BedDouble className="w-16 h-16 text-white/50" />
                  </div>
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-blue-600">
                    {room.type}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Quarto {room.type}</h3>
                  <p className="text-gray-600 mb-4">{room.description}</p>
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <BedDouble className="w-4 h-4" />
                      Até {room.capacity} pessoas
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">R$ {room.price}</span>
                      <span className="text-gray-500 text-sm">/noite</span>
                    </div>
                    <Link
                      href={`/reservar?tipo=${room.type.toLowerCase()}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Reservar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/reservar"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              Ver disponibilidade completa
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section id="comodidades" className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Comodidades
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Tudo que você precisa para uma estadia perfeita
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {amenities.map((amenity) => (
              <div key={amenity.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-colors">
                <amenity.icon className="w-8 h-8 text-white mx-auto mb-3" />
                <p className="text-white font-medium">{amenity.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que nossos hóspedes dizem
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A satisfação dos nossos hóspedes é nossa maior recompensa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">{testimonial.name[0]}</span>
                  </div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pronto para sua próxima aventura?
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Reserve agora e garanta os melhores preços. Pagamento facilitado e cancelamento gratuito.
          </p>
          <Link
            href="/reservar"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
          >
            <Calendar className="w-5 h-5" />
            Fazer Minha Reserva
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Entre em Contato
              </h2>
              <p className="text-gray-600 mb-8">
                Tem alguma dúvida? Nossa equipe está pronta para ajudar. 
                Entre em contato conosco através de qualquer um dos canais abaixo.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Endereço</p>
                    <p className="text-gray-600">Av. Beira Mar, 1000 - Praia Central</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Telefone</p>
                    <p className="text-gray-600">(11) 99999-9999</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">E-mail</p>
                    <p className="text-gray-600">contato@pousadamaresia.com.br</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <a href="#" className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="bg-gray-100 rounded-2xl h-80 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Mapa da localização</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Waves className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">Pousada Maresia</span>
              </div>
              <p className="text-gray-400 text-sm">
                Seu refúgio à beira-mar. Conforto, tranquilidade e momentos inesquecíveis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#sobre" className="hover:text-white transition-colors">Sobre Nós</a></li>
                <li><a href="#quartos" className="hover:text-white transition-colors">Quartos</a></li>
                <li><a href="#comodidades" className="hover:text-white transition-colors">Comodidades</a></li>
                <li><Link href="/reservar" className="hover:text-white transition-colors">Reservar</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Av. Beira Mar, 1000</li>
                <li>(11) 99999-9999</li>
                <li>contato@pousadamaresia.com.br</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Redes Sociais</h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Pousada Maresia. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
