'use client';

import { useState, useEffect } from "react";
import { Account, AccountType } from "@/lib/types/database.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { createAccount, updateAccount } from "@/lib/actions/accounts";
import { Loader2 } from "lucide-react";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account | null;
}

export function AccountDialog({ open, onOpenChange, account }: AccountDialogProps) {
  const isEditing = !!account;
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash' as AccountType,
    initial_balance: '0',
    current_balance: '0',
    is_active: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Actualizar el formulario cuando cambia la cuenta
  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        type: account.type,
        initial_balance: account.initial_balance?.toString() || '0',
        current_balance: account.current_balance?.toString() || '0',
        is_active: account.is_active,
      });
    } else {
      // Resetear para modo creación
      setFormData({
        name: '',
        type: 'cash',
        initial_balance: '0',
        current_balance: '0',
        is_active: true,
      });
    }
  }, [account, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // En modo creación, no enviamos current_balance (el trigger lo maneja)
      // En modo edición, sí lo enviamos para poder actualizarlo
      const data = {
        name: formData.name,
        type: formData.type,
        initial_balance: parseFloat(formData.initial_balance),
        ...(isEditing && { current_balance: parseFloat(formData.current_balance) }),
        is_active: formData.is_active,
      };

      let result;
      if (isEditing && account) {
        result = await updateAccount(account.id, data);
      } else {
        result = await createAccount(data);
      }

      if (result.error) {
        setError(result.error);
      } else {
        onOpenChange(false);
        // Reset form
        setFormData({
          name: '',
          type: 'cash',
          initial_balance: '0',
          current_balance: '0',
          is_active: true,
        });
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Account' : 'Create New Account'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the account information below.'
                : 'Fill in the details to create a new account.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Account Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                placeholder="e.g., Main Bank Account"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Account Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">Account Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: AccountType) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Account</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Initial Balance - Solo para crear */}
            {!isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="initial_balance">Initial Balance</Label>
                <Input
                  id="initial_balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.initial_balance}
                  onChange={(e) =>
                    setFormData({ ...formData, initial_balance: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This will be set as the current balance automatically
                </p>
              </div>
            )}

            {/* Initial Balance (read-only) - Para editar */}
            {isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="initial_balance">Initial Balance</Label>
                <Input
                  id="initial_balance"
                  type="number"
                  step="0.01"
                  value={formData.initial_balance}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Initial balance cannot be changed
                </p>
              </div>
            )}

            {/* Current Balance - Solo para editar */}
            {isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="current_balance">Current Balance</Label>
                <Input
                  id="current_balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.current_balance}
                  onChange={(e) =>
                    setFormData({ ...formData, current_balance: e.target.value })
                  }
                  required
                />
              </div>
            )}

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked as boolean })
                }
              />
              <Label
                htmlFor="is_active"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Active account
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update Account' : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
