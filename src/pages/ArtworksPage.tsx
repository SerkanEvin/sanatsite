import { useEffect, useState } from 'react';
import { Filter } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import type { Artwork, Artist, Category } from '../lib/database.types';
import { CornerFrame, AbstractBrush, CirclePattern, Sparkle, DottedCircle, PaintSplatter, HandDrawnStar, FloatingShapes, ScribbleCircle, Doodle } from '../components/DecorativeElements';

interface ArtworkWithArtist extends Artwork {
  artists: Artist;
}

export default function ArtworksPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCategory = searchParams.get('category');

  const { t } = useLanguage();
  const [artworks, setArtworks] = useState<ArtworkWithArtist[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArtist, setSelectedArtist] = useState<string>('all');
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    loadCategories();
    loadArtists();
  }, []);

  useEffect(() => {
    if (initialCategory && categories.length > 0) {
      // Find match in DB
      const dbCat = categories.find(c => c.slug === initialCategory);
      if (dbCat) {
        setSelectedCategory(dbCat.id);
      } else {
        // If not in DB, but is a valid footer category, select it "visually" (will show 0 results)
        setSelectedCategory(`slug:${initialCategory}`);
      }
    }
  }, [initialCategory, categories]);

  useEffect(() => {
    loadArtworks();
  }, [selectedCategory, selectedArtist]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (data) {
      setCategories(data);
    }
  };

  const loadArtists = async () => {
    const { data } = await supabase
      .from('artists')
      .select('*')
      .order('name');

    if (data) {
      setArtists(data as Artist[]);
    }
  };

  const loadArtworks = async () => {
    setLoading(true);

    // If selectedCategory is a synthetic slug (missing in DB), return empty immediately
    if (selectedCategory.startsWith('slug:')) {
      setArtworks([]);
      setLoading(false);
      return;
    }

    let query = supabase
      .from('artworks')
      .select('*, artists(*)')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    // Category filter
    if (selectedCategory !== 'all') {
      query = query.eq('category_id', selectedCategory);
    }

    // Artist filter (PRIMARY)
    if (selectedArtist !== 'all') {
      query = query.eq('artist_id', selectedArtist);
    }



    const { data } = await query;

    if (data) {
      // Filter out artworks without images
      const validArtworks = (data as ArtworkWithArtist[]).filter(a => a.image_url && a.image_url.trim() !== '');
      setArtworks(validArtworks);
    }
    setLoading(false);
  };

  // New category system - matches Footer
  const CATEGORY_FILTERS = [
    { slug: 'open-edition-prints' },
    { slug: 'photography' },
    { slug: 'digital-art' },
    { slug: 'original-works' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="relative bg-gradient-to-br from-pink-100 via-orange-100 to-yellow-100 py-32 overflow-hidden">
        {/* Artistic Background Elements */}
        <CornerFrame position="top-left" className="opacity-60" />
        <CornerFrame position="top-right" className="opacity-60" />

        {/* Paint Splatters - Multiple sizes and positions */}
        <PaintSplatter className="top-10 left-10 opacity-50" size={150} />
        <PaintSplatter className="top-20 right-40 opacity-40" size={120} />
        <PaintSplatter className="bottom-12 right-1/4 opacity-50" size={130} />
        <PaintSplatter className="bottom-20 left-1/3 opacity-35" size={110} />

        {/* Abstract Brush Strokes */}
        <AbstractBrush className="top-20 right-32 animate-float opacity-60" />
        <AbstractBrush className="bottom-24 left-16 rotate-45 opacity-50" />
        <AbstractBrush className="top-1/2 right-10 -rotate-12 opacity-45" />

        {/* Floating Shapes and Patterns */}
        <FloatingShapes className="top-24 left-20" />
        <FloatingShapes className="bottom-32 right-24" />
        <CirclePattern className="bottom-10 left-10 animate-pulse opacity-30" />
        <CirclePattern className="top-16 right-16 animate-pulse opacity-20" />

        {/* Dotted Circles */}
        <DottedCircle className="top-12 left-1/4 animate-float" size={100} />
        <DottedCircle className="bottom-16 right-20 animate-float delay-200" size={100} />
        <DottedCircle className="top-32 right-1/3 animate-float delay-400" size={80} />

        {/* Sparkles */}
        <Sparkle className="top-16 left-1/4" delay={0} />
        <Sparkle className="top-32 right-1/3" delay={300} />
        <Sparkle className="bottom-24 left-1/3" delay={600} />
        <Sparkle className="top-1/2 left-10" delay={900} />

        {/* Hand Drawn Stars */}
        <HandDrawnStar className="top-20 left-1/3" delay={200} />
        <HandDrawnStar className="bottom-28 right-1/4" delay={500} />

        {/* Artistic Doodles */}
        <Doodle className="top-28 right-10 animate-float" type="swirl" />
        <Doodle className="bottom-20 left-20 animate-float delay-300" type="wave" />
        <Doodle className="top-40 left-1/2 animate-float delay-600" type="zigzag" />

        {/* Scribble Circles */}
        <ScribbleCircle className="top-24 right-1/4 opacity-40" size={90} />
        <ScribbleCircle className="bottom-32 left-1/4 opacity-30" size={70} />

        {/* Animated Gradient Orbs */}
        <div className="absolute top-10 right-20 w-56 h-56 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float"></div>
        <div className="absolute bottom-10 left-20 w-56 h-56 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float delay-200"></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float delay-400"></div>
        <div className="absolute top-1/3 right-1/3 w-52 h-52 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-float delay-600"></div>
        <div className="absolute top-40 left-10 w-40 h-40 bg-rose-400 rounded-full mix-blend-multiply filter blur-2xl opacity-35 animate-float delay-800"></div>
        <div className="absolute bottom-40 right-10 w-44 h-44 bg-amber-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-float delay-1000"></div>

        {/* Artistic Border Accents */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-6">
            <div className="hidden inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-sm font-medium text-orange-600 mb-4 opacity-0 animate-fadeIn">
              <span>{t('exploreOurCollection')}</span>
            </div>

            {/* Title with artistic underline */}
            <div className="relative inline-block">
              <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tight">
                {t('artworksHeroTitle')}
              </h1>
              {/* Artistic underline */}
              <div className="absolute -bottom-2 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-70 rounded-full"></div>
            </div>

            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('artworksHeroSubtitle')}
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-4 opacity-0 animate-fadeInUp delay-300">
              <button
                onClick={() => window.scrollTo({ top: (document.querySelector('.max-w-7xl.mx-auto.px-4.sm\\:px-6.lg\\:px-8.py-12')?.getBoundingClientRect().top ?? 0) + window.scrollY - 100, behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-400 via-orange-500 to-yellow-500 text-white rounded-full font-medium text-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                {t('browseArtworks')}
              </button>
            </div>
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <DottedCircle className="top-20 right-10" size={80} />
        <AbstractBrush className="top-60 left-10 rotate-180" />
        <Sparkle className="top-40 right-1/4" delay={100} />
        <HandDrawnStar className="top-32 left-20" delay={200} />
        <PaintSplatter className="top-96 right-32" size={75} />
        <ScribbleCircle className="top-72 left-1/4" size={70} />
        <FloatingShapes className="bottom-20 right-1/3" />
        <Doodle className="top-52 right-10 animate-float delay-300" type="wave" />

        {/* PRIMARY FILTER: Artist */}
        <div className="mb-8 bg-gradient-to-r from-pink-50 via-orange-50 to-yellow-50 p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-orange-600" />
            <span className="font-bold text-gray-900 text-lg">{t('filterByArtist')}</span>
          </div>
          <select
            value={selectedArtist}
            onChange={(e) => setSelectedArtist(e.target.value)}
            className="w-full md:w-1/2 px-4 py-3 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
          >
            <option value="all">{t('allArtists')}</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>
                {artist.name}
              </option>
            ))}
          </select>
        </div>



        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">{t('filterByCategory')}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${selectedCategory === 'all'
                ? 'bg-gradient-to-r from-pink-400 via-orange-500 to-yellow-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {t('all')}
            </button>
            {CATEGORY_FILTERS.map((filterCat) => {
              // Find matching DB category to get ID
              const dbCat = categories.find(c => c.slug === filterCat.slug);

              // Check if selected either by ID or by synthetic slug
              const isSelected = (dbCat && selectedCategory === dbCat.id) ||
                (selectedCategory === `slug:${filterCat.slug}`);

              const clickHandler = () => {
                if (dbCat) {
                  setSelectedCategory(dbCat.id);
                } else {
                  setSelectedCategory(`slug:${filterCat.slug}`);
                }
              };

              return (
                <button
                  key={filterCat.slug}
                  onClick={clickHandler}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${isSelected
                    ? 'bg-gradient-to-r from-pink-400 via-orange-500 to-yellow-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {t(filterCat.slug)}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-2xl mb-4" />
                <div className="h-6 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">{t('noArtworksInCategory')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworks.map((artwork, index) => (
              <div
                key={artwork.id}
                onClick={() => navigate(`/artwork/${artwork.id}`, {
                  state: { from: 'all-works' }
                })}
                className={`group cursor-pointer opacity-0 animate-scaleIn delay-${Math.min((index % 8) * 100, 600)}`}
              >
                <div className="relative overflow-hidden rounded-2xl mb-4 aspect-square bg-gradient-to-br from-gray-100 to-gray-200 shadow-md group-hover:shadow-2xl transition-all duration-500">
                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-3 right-3 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-80 transition-opacity duration-300"></div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:via-orange-600 group-hover:to-yellow-500 group-hover:bg-clip-text transition-all duration-300 truncate">
                    {artwork.title}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (artwork.artists) {
                        navigate(artwork.artists.slug ? `/${artwork.artists.slug}` : `/artist/${artwork.artist_id}`);
                      }
                    }}
                    className="text-sm text-gray-600 hover:text-orange-600 transition-colors duration-300"
                  >
                    {artwork.artists?.name || t('unknownArtist')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
