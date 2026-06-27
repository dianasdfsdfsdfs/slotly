import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const db = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 12)

  const owner = await db.user.upsert({
    where: { email: "owner@demo.slotly" },
    update: {},
    create: { email: "owner@demo.slotly", name: "Demo Owner", passwordHash },
  })

  const tenant = await db.tenant.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo Barbershop",
      slug: "demo",
      timezone: "Europe/Bratislava",
      memberships: { create: { userId: owner.id, role: "OWNER" } },
    },
  })

  // Reset the demo catalog so re-running gives a clean state (cascades links).
  await db.service.deleteMany({ where: { tenantId: tenant.id } })
  await db.staff.deleteMany({ where: { tenantId: tenant.id } })

  const [haircut, beard, combo] = await Promise.all([
    db.service.create({
      data: {
        tenantId: tenant.id,
        name: "Haircut",
        durationMinutes: 30,
        priceCents: 2500,
        color: "#10b981",
      },
    }),
    db.service.create({
      data: {
        tenantId: tenant.id,
        name: "Beard trim",
        durationMinutes: 15,
        priceCents: 1500,
        color: "#3b82f6",
      },
    }),
    db.service.create({
      data: {
        tenantId: tenant.id,
        name: "Haircut + Beard",
        durationMinutes: 45,
        priceCents: 3500,
        color: "#8b5cf6",
      },
    }),
  ])

  const [alex, sam] = await Promise.all([
    db.staff.create({
      data: { tenantId: tenant.id, displayName: "Alex", bio: "Senior barber" },
    }),
    db.staff.create({
      data: {
        tenantId: tenant.id,
        displayName: "Sam",
        bio: "Fades specialist",
      },
    }),
  ])

  await db.staffService.createMany({
    data: [
      { staffId: alex.id, serviceId: haircut.id },
      { staffId: alex.id, serviceId: beard.id },
      { staffId: alex.id, serviceId: combo.id },
      { staffId: sam.id, serviceId: haircut.id },
      { staffId: sam.id, serviceId: combo.id },
    ],
  })

  // Mon–Sat, 09:00–18:00 for both staff.
  const workingHours = [alex.id, sam.id].flatMap((staffId) =>
    [1, 2, 3, 4, 5, 6].map((weekday) => ({
      staffId,
      weekday,
      startMinutes: 9 * 60,
      endMinutes: 18 * 60,
    }))
  )
  await db.workingHours.createMany({ data: workingHours })

  console.log(
    "Seeded demo business → /book/demo  (owner login: owner@demo.slotly / demo1234)"
  )
}

main()
  .then(() => db.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await db.$disconnect()
    process.exit(1)
  })
