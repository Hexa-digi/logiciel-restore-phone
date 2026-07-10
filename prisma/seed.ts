import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.APP_OWNER_EMAIL || "contact.hexadigi@gmail.com";
  const password = process.env.APP_OWNER_PASSWORD || "change-moi";
  const companyName = process.env.COMPANY_NAME || "Hexa Digi";

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      name: "Admin",
      companyName,
    },
  });

  const templateCount = await prisma.emailTemplate.count();
  if (templateCount === 0) {
    await prisma.emailTemplate.createMany({
      data: [
        {
          nom: "Premier contact prospection",
          categorie: "prospection",
          sujet: "{{entreprise}} <> {{ma_societe}} - une idee de collaboration",
          corps:
            "Bonjour {{prenom}},\n\nJe me permets de vous contacter car je pense que {{ma_societe}} pourrait apporter une vraie valeur a {{entreprise}}.\n\nAuriez-vous 15 minutes cette semaine pour en discuter ?\n\nBien cordialement,\n{{signature}}",
        },
        {
          nom: "Relance sans reponse",
          categorie: "relance",
          sujet: "Petite relance - {{entreprise}}",
          corps:
            "Bonjour {{prenom}},\n\nJe reviens vers vous suite a mon precedent message, sans nouvelles de votre part.\n\nRestez-vous interesse(e) par un echange ? N'hesitez pas a me dire si le timing n'est pas bon.\n\nBien cordialement,\n{{signature}}",
        },
        {
          nom: "Envoi de devis",
          categorie: "devis",
          sujet: "Votre devis {{numero_devis}}",
          corps:
            "Bonjour {{prenom}},\n\nVeuillez trouver ci-joint le devis {{numero_devis}} correspondant a notre echange.\n\nIl reste valable jusqu'au {{date_validite}}. N'hesitez pas si vous avez la moindre question.\n\nBien cordialement,\n{{signature}}",
        },
      ],
    });
  }

  const sourceCount = await prisma.newsSource.count();
  if (sourceCount === 0) {
    await prisma.newsSource.createMany({
      data: [
        { nom: "TechCrunch", url: "https://techcrunch.com/feed/", categorie: "tech" },
        { nom: "Numerama", url: "https://www.numerama.com/feed/", categorie: "tech" },
        { nom: "Les Echos - Entrepreneurs", url: "https://www.lesechos.fr/rss/rss_entrepreneurs.xml", categorie: "juridique" },
        { nom: "Service-Public.fr - Actualites", url: "https://www.service-public.fr/professionnels-entreprises/rss", categorie: "juridique" },
        { nom: "Boursorama - Marches", url: "https://www.boursorama.com/rss/actualites/marches", categorie: "trading" },
        { nom: "01net", url: "https://www.01net.com/actualites/feed/", categorie: "communication" },
      ],
    });
  }

  console.log(`Utilisateur pret: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
