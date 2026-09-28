import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import {
  PageHeader,
  Card,
  CardHeader,
  CardContent,
  Button,
  IconButton,
  Switch,
  ConfirmDialog
} from '../components';
import {
  Settings,
  Sun,
  Moon,
  RotateCcw,
  Mail,
  ShieldCheck,
  Bell,
  CheckCircle2,
  Smartphone,
  Sliders,
  Send
} from 'lucide-react';

export const SettingsConfigPage: React.FC = () => {
  const { resetToMockData } = useOnboarding();
  const { mode, toggleTheme } = useTheme();
  const { success, info } = useToast();

  // Notification settings
  const [systemNotifications, setSystemNotifications] = useState(() => {
    return localStorage.getItem('quantira_setting_sys_notifications') !== 'false';
  });
  const [emailNotifications, setEmailNotifications] = useState(() => {
    return localStorage.getItem('quantira_setting_email_notifications') !== 'false';
  });
  const [pushNotifications, setPushNotifications] = useState(() => {
    return localStorage.getItem('quantira_setting_push_notifications') !== 'false';
  });
  const [managerDigest, setManagerDigest] = useState(() => {
    return localStorage.getItem('quantira_setting_manager_digest') !== 'false';
  });

  // Email & Automation settings
  const [emailInvites, setEmailInvites] = useState(() => {
    return localStorage.getItem('quantira_setting_email_invites') !== 'false';
  });
  const [welcomeEmail, setWelcomeEmail] = useState(() => {
    return localStorage.getItem('quantira_setting_welcome_email') !== 'false';
  });
  const [autoSso, setAutoSso] = useState(() => {
    return localStorage.getItem('quantira_setting_auto_sso') !== 'false';
  });
  const [slackAlerts, setSlackAlerts] = useState(() => {
    return localStorage.getItem('quantira_setting_slack_alerts') !== 'false';
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Sync settings
  const handleToggle = (key: string, val: boolean, setter: (v: boolean) => void, label: string) => {
    setter(val);
    try {
      localStorage.setItem(key, String(val));
    } catch {}
    info('Setting Updated', `${label} is now ${val ? 'ON' : 'OFF'}.`);
  };

  const handleReset = () => {
    resetToMockData();
    setShowResetConfirm(false);
    success('Data Reset Complete', 'All candidate records, tasks, and demo states restored to default.');
  };

  return (
    <div className="space-y-6 text-left w-full animate-fade-in pb-12">
      <PageHeader
        title="Settings & System Preferences"
        description="System preferences"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Notifications & Email Dispatch */}
        <div className="space-y-6">
          {/* 1. Notification Preferences Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Notification Preferences
                </h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 block">
                    System In-App Notifications
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Receive live status updates, approval alerts, and progress notices in the top navigation bar.
                  </span>
                </div>
                <Switch
                  checked={systemNotifications}
                  onChange={(val) =>
                    handleToggle('quantira_setting_sys_notifications', val, setSystemNotifications, 'System Notifications')
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 block">
                    Push &amp; Desktop Alerts
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Show instant browser notifications when a candidate submits documents or completes a step.
                  </span>
                </div>
                <Switch
                  checked={pushNotifications}
                  onChange={(val) =>
                    handleToggle('quantira_setting_push_notifications', val, setPushNotifications, 'Push Notifications')
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 block">
                    Weekly Manager Digest
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Send managers a consolidated weekly onboarding report regarding their incoming team hires.
                  </span>
                </div>
                <Switch
                  checked={managerDigest}
                  onChange={(val) =>
                    handleToggle('quantira_setting_manager_digest', val, setManagerDigest, 'Weekly Manager Digest')
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* 2. Email Communication Settings Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Email Communication &amp; Dispatch Settings
                </h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 block">
                    Email Notifications (Global)
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Allow the portal to transmit email notifications for actions, approvals, and reminders.
                  </span>
                </div>
                <Switch
                  checked={emailNotifications}
                  onChange={(val) =>
                    handleToggle('quantira_setting_email_notifications', val, setEmailNotifications, 'Email Notifications')
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 block">
                    Automated Onboarding Email Invitations
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Immediately send personalized 10-step onboarding invitation links to new hires upon creation.
                  </span>
                </div>
                <Switch
                  checked={emailInvites}
                  onChange={(val) =>
                    handleToggle('quantira_setting_email_invites', val, setEmailInvites, 'Automated Onboarding Invitations')
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 block">
                    Welcome Packet &amp; First-Day Instructions Email
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Automatically dispatch schedule, parking passes, and Day 1 orientation guidelines 48 hours prior to start date.
                  </span>
                </div>
                <Switch
                  checked={welcomeEmail}
                  onChange={(val) =>
                    handleToggle('quantira_setting_welcome_email', val, setWelcomeEmail, 'Welcome Packet Email')
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Workflow Automations, Theme & System Reset */}
        <div className="space-y-6">
          {/* 3. Automation Triggers */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Workflow &amp; Provisioning Automations
                </h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 block">
                    Automated Okta / Google SSO Provisioning
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Create user in identity provider once candidate accepts NDA and enters step 4.
                  </span>
                </div>
                <Switch
                  checked={autoSso}
                  onChange={(val) =>
                    handleToggle('quantira_setting_auto_sso', val, setAutoSso, 'Automated SSO Provisioning')
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 block">
                    Slack Team Notification on Completion
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Post arrival announcements in #welcome-team when employee finishes 10th review step.
                  </span>
                </div>
                <Switch
                  checked={slackAlerts}
                  onChange={(val) =>
                    handleToggle('quantira_setting_slack_alerts', val, setSlackAlerts, 'Slack Team Notifications')
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* 4. Appearance Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {mode === 'dark' ? (
                  <Moon className="w-4 h-4 text-amber-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Interface Theme &amp; Accessibility
                </h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 block">
                    Dark Mode Appearance
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Currently using {mode === 'dark' ? 'High-contrast Dark' : 'Clean Light'} theme.
                  </span>
                </div>
                <IconButton
                  variant="secondary"
                  size="sm"
                  icon={mode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
                  aria-label={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`}
                  onClick={toggleTheme}
                />
              </div>
            </CardContent>
          </Card>

          {/* 5. Demo Reset Card */}
          <Card className="border-rose-200/60 dark:border-rose-900/40">
            <CardHeader>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-500" />
                <h2 className="text-base font-semibold text-rose-600 dark:text-rose-400">
                  Demo Environment &amp; Data Management
                </h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 dark:text-slate-400">
                Reset all local candidates, task checklists, and 10-step progress back to original seeded demo records.
              </p>
              <IconButton
                variant="destructive"
                size="sm"
                icon={<RotateCcw className="w-4 h-4" />}
                aria-label="Reset All Demo Data"
                onClick={() => setShowResetConfirm(true)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset All Onboarding Demo Data?"
        message="This will wipe all newly added employees, custom uploaded files, and modified task statuses, resetting the application back to the initial sample state."
        confirmLabel="Confirm Reset"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
};
