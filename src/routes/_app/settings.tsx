import { createFileRoute } from '@tanstack/react-router'
import { User, Bell, Lock } from 'lucide-react'
import { TopBar } from '#/components/layout/TopBar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '#/components/ui/tabs'
import { ProfileTab } from '#/components/features/settings/ProfileTab'
import { NotificationsTab } from '#/components/features/settings/NotificationsTab'
import { SecurityTab } from '#/components/features/settings/SecurityTab'

export const Route = createFileRoute('/_app/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div>
      <TopBar title="Configuración" subtitle="Gestiona tu perfil y preferencias" />

      <div className="p-6">
        <Tabs defaultValue="profile" className="max-w-2xl">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="h-4 w-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4" /> Notificaciones
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4" /> Seguridad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>

          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
