import { PrismaClient, UserRole, BusinessType, BookingStatus } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Türkçe Seed Verisi Yükleniyor...")

  // Temizle
  await prisma.review.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.staffTimeOff.deleteMany()
  await prisma.staffWorkingHours.deleteMany()
  await prisma.staffService.deleteMany()
  await prisma.service.deleteMany()
  await prisma.staff.deleteMany()
  await prisma.businessHours.deleteMany()
  await prisma.business.deleteMany()
  await prisma.user.deleteMany()

  // 1. Örnek Kullanıcılar
  const ownerUser = await prisma.user.create({
    data: {
      name: "Ahmet",
      surname: "Yılmaz",
      email: "ahmet@oxonomberber.com",
      phone: "+90 532 111 2233",
      role: UserRole.BUSINESS_OWNER,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  })

  const customerUser = await prisma.user.create({
    data: {
      name: "Can",
      surname: "Demir",
      email: "can@example.com",
      phone: "+90 555 999 8877",
      role: UserRole.CUSTOMER,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  })

  // 2. Örnek İşletmeler
  const businessesData = [
    {
      name: "Moda Klasik Berber Salonu",
      slug: "moda-klasik-berber-salonu",
      type: BusinessType.BARBER,
      description: "Kadıköy Moda'nın kalbinde geleneksel ustura tıraşı, modern saç kesimi ve kişiye özel saç bakımı hizmeti sunuyoruz.",
      phone: "+90 216 333 4455",
      email: "moda@oxonomberber.com",
      address: "Moda Caddesi No: 42/A",
      city: "İstanbul",
      district: "Kadıköy",
      coverImage: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&auto=format&fit=crop&q=80",
      logo: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&auto=format&fit=crop&q=80",
      active: true,
      verified: true,
      staffList: [
        { name: "Mustafa", surname: "Usta", bio: "20 yıllık usta berber, klasik saç & sakal uzmanı.", phone: "+90 530 111 0001", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80" },
        { name: "Burak", surname: "Kaya", bio: "Modern kesimler ve fade tıraş konusunda uzman.", phone: "+90 530 111 0002", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80" },
      ],
      servicesList: [
        { name: "Klasik Saç Kesimi", description: "Yıkama, kesim ve stil fönü dahil.", price: 450, durationMinutes: 45 },
        { name: "Sakal Şekillendirme & Tıraş", description: "Sıcak havlu eşliğinde geleneksel ustura tıraşı.", price: 250, durationMinutes: 30 },
        { name: "Saç & Sakal Bakım Kombini", description: "Tam bakım: Saç kesimi, sakal tıraşı ve canlandırıcı maske.", price: 650, durationMinutes: 60 },
        { name: "Detoks Saç & Cilt Bakımı", description: "Buharlı cilt temizliği ve saç kökü besleyici bakım.", price: 400, durationMinutes: 40 },
      ],
    },
    {
      name: "Bosphorus Beşiktaş Saç Stüdyosu",
      slug: "bosphorus-besiktas-sac-studyosu",
      type: BusinessType.HAIRDRESSER,
      description: "Beşiktaş Çarşı'da ferah ve modern stüdyomuzda dünya trendleri saç kesimleri ve renklendirme işlemleri.",
      phone: "+90 212 258 7788",
      email: "besiktas@oxonomberber.com",
      address: "Sinanpaşa Mah. Şair Nedim Cad. No: 18",
      city: "İstanbul",
      district: "Beşiktaş",
      coverImage: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&auto=format&fit=crop&q=80",
      logo: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=200&auto=format&fit=crop&q=80",
      active: true,
      verified: true,
      staffList: [
        { name: "Serkan", surname: "Öztürk", bio: "Kreatif saç tasarımcısı ve renklendirme artisti.", phone: "+90 532 222 0001", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80" },
        { name: "Eren", surname: "Yıldız", bio: "Modern kesimler ve keratin terapi uzmanı.", phone: "+90 532 222 0002", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80" },
      ],
      servicesList: [
        { name: "Modern Saç Kesimi & Yıkama", description: "Kişinin yüz yapısına özel modern saç tasarımı.", price: 500, durationMinutes: 45 },
        { name: "Sakal Tasarımı", description: "Detaylı sakal hattı ve bakım yağı uygulaması.", price: 300, durationMinutes: 30 },
        { name: "Keratin Düzleştirme & Bakım", description: "Yıpranmış saçları onaran yoğun keratin seansı.", price: 900, durationMinutes: 75 },
        { name: "Saç Boyama & Kamuflaj", description: "Beyaz kırıcı doğal renk tonlama.", price: 750, durationMinutes: 60 },
      ],
    },
    {
      name: "Nişantaşı Elegance VIP Kuaför",
      slug: "nisantasi-elegance-vip-kuafor",
      type: BusinessType.BEAUTY_SALON,
      description: "Nişantaşı'nda VIP saç tasarımı, manikür, cilt bakımı ve kişisel stil danışmanlığı ile lüks deneyim.",
      phone: "+90 212 296 3322",
      email: "nisantasi@oxonomberber.com",
      address: "Teşvikiye Mah. Valikonağı Cad. No: 76",
      city: "İstanbul",
      district: "Şişli",
      coverImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80",
      logo: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200&auto=format&fit=crop&q=80",
      active: true,
      verified: true,
      staffList: [
        { name: "Arda", surname: "Şen", bio: "Ünlüler stil danışmanı, master saç uzmanı.", phone: "+90 533 333 0001", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80" },
        { name: "Cem", surname: "Kurt", bio: "Gelişmiş cilt bakımı ve saç terapisti.", phone: "+90 533 333 0002", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80" },
      ],
      servicesList: [
        { name: "VIP Saç Kesimi & Stil", description: "Saç analizi, özel yıkama ve stilist kesimi.", price: 750, durationMinutes: 50 },
        { name: "Premium Sakal Bakımı", description: "Sıcak buhar, organik yağlar ve hat belirleme.", price: 400, durationMinutes: 35 },
        { name: "Altın Maske Cilt Bakımı", description: "Gözenek temizliği, siyah nokta arındırma ve nem takviyesi.", price: 600, durationMinutes: 45 },
      ],
    },
    {
      name: "Üsküdar Nostalji Saç & Sakal",
      slug: "uskudar-nostalji-sac-sakal",
      type: BusinessType.BARBER,
      description: "Boğaz kıyısında samimi, güler yüzlü ve kaliteli esnaf berberliği tecrübesi.",
      phone: "+90 216 555 1234",
      email: "uskudar@oxonomberber.com",
      address: "Salacak Mah. Sahil Yolu No: 12",
      city: "İstanbul",
      district: "Üsküdar",
      coverImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&auto=format&fit=crop&q=80",
      logo: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&auto=format&fit=crop&q=80",
      active: true,
      verified: true,
      staffList: [
        { name: "Kemal", surname: "Çelik", bio: "Geleneksel berberlik sanatı ustası.", phone: "+90 534 444 0001", image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80" },
      ],
      servicesList: [
        { name: "Klasik Saç Kesimi", description: "Yıkama ve fön dahil geleneksel kesim.", price: 350, durationMinutes: 40 },
        { name: "Ustura Sakal Tıraşı", description: "Köpüklü sıcak havlulu ustura tıraşı.", price: 200, durationMinutes: 25 },
        { name: "Çocuk Saç Kesimi", description: "Çocuklar için sabırlı ve özenli kesim.", price: 250, durationMinutes: 30 },
      ],
    },
    {
      name: "Bakırköy Ataköy Prime Kuaför",
      slug: "bakirkoy-atakoy-prime-kuafor",
      type: BusinessType.HAIRDRESSER,
      description: "Modern mimari, hijyenik salon konsepti ve alanında uzman kadrosuyla hizmetinizdeyiz.",
      phone: "+90 212 560 9988",
      email: "bakirkoy@oxonomberber.com",
      address: "Ataköy 5. Kısım Çarşı İçi No: 24",
      city: "İstanbul",
      district: "Bakırköy",
      coverImage: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1200&auto=format&fit=crop&q=80",
      logo: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=200&auto=format&fit=crop&q=80",
      active: true,
      verified: true,
      staffList: [
        { name: "Onur", surname: "Aydın", bio: "Erkek saç trendleri ve saç renklendirme uzmanı.", phone: "+90 535 555 0001", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80" },
      ],
      servicesList: [
        { name: "Trend Saç Kesimi", description: "Kişiye özel tasarım ve fön.", price: 450, durationMinutes: 45 },
        { name: "Sakal Bakımı & Kesim", description: "Sakal bakımı ve özel şekillendirme.", price: 250, durationMinutes: 30 },
      ],
    },
  ]

  for (const bData of businessesData) {
    const business = await prisma.business.create({
      data: {
        ownerId: ownerUser.id,
        name: bData.name,
        slug: bData.slug,
        type: bData.type,
        description: bData.description,
        phone: bData.phone,
        email: bData.email,
        address: bData.address,
        city: bData.city,
        district: bData.district,
        coverImage: bData.coverImage,
        logo: bData.logo,
        active: bData.active,
        verified: bData.verified,
      },
    })

    // Çalışma Saatleri (Pzt-Cmt: 09:00-20:00, Paz: Kapalı)
    for (let day = 0; day <= 6; day++) {
      await prisma.businessHours.create({
        data: {
          businessId: business.id,
          dayOfWeek: day,
          openTime: "09:00",
          closeTime: "20:00",
          isClosed: day === 0, // Pazar kapalı
        },
      })
    }

    // Hizmetleri Ekle
    const createdServices = []
    for (const sData of bData.servicesList) {
      const service = await prisma.service.create({
        data: {
          businessId: business.id,
          name: sData.name,
          description: sData.description,
          price: sData.price,
          durationMinutes: sData.durationMinutes,
        },
      })
      createdServices.push(service)
    }

    // Çalışanları Ekle
    for (const stData of bData.staffList) {
      const staff = await prisma.staff.create({
        data: {
          businessId: business.id,
          name: stData.name,
          surname: stData.surname,
          bio: stData.bio,
          phone: stData.phone,
          image: stData.image,
        },
      })

      // Çalışanın Çalışma Saatleri
      for (let day = 0; day <= 6; day++) {
        await prisma.staffWorkingHours.create({
          data: {
            staffId: staff.id,
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "19:00",
            isWorking: day !== 0,
          },
        })
      }

      // Çalışanı Hizmetlerle İlişkilendir
      for (const service of createdServices) {
        await prisma.staffService.create({
          data: {
            staffId: staff.id,
            serviceId: service.id,
          },
        })
      }

      // Örnek Bir Randevu Oluştur (Moda berber için)
      if (bData.slug === "moda-klasik-berber-salonu" && stData.name === "Mustafa") {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(14, 0, 0, 0)
        const tomorrowEnd = new Date(tomorrow)
        tomorrowEnd.setMinutes(tomorrow.getMinutes() + 45)

        await prisma.booking.create({
          data: {
            customerId: customerUser.id,
            businessId: business.id,
            serviceId: createdServices[0].id,
            staffId: staff.id,
            startAt: tomorrow,
            endAt: tomorrowEnd,
            priceSnapshot: createdServices[0].price,
            durationSnapshot: createdServices[0].durationMinutes,
            status: BookingStatus.CONFIRMED,
            customerNote: "Klasik yanlar kısa üstler uzun olsun lütfen.",
          },
        })
      }
    }

    // Örnek Yorumlar
    await prisma.review.create({
      data: {
        customerId: customerUser.id,
        businessId: business.id,
        rating: 5,
        comment: "Harika bir deneyim! Hizmet çok kaliteli, çalışanlar çok ilgili ve güler yüzlü.",
      },
    })
  }

  console.log("✅ Seed verisi başarıyla yüklendi!")
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
