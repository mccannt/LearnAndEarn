"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Package2, RotateCcw, Sparkles } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { ParentWorkspaceShell } from "@/components/parent-workspace-shell";
import { MotionGroup, MotionItem } from "@/components/learner-motion";
import { type AvatarCatalogItemDto, type RewardCatalogItemDto } from "@/lib/catalog";

type EditableAvatarItem = AvatarCatalogItemDto & {
  isSaving?: boolean;
};

type EditableRewardItem = RewardCatalogItemDto & {
  isSaving?: boolean;
};

const workspacePanelClass =
  "overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/78 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 dark:shadow-[0_24px_60px_rgba(2,6,23,0.35)]";

export function ParentCatalogManager() {
  const router = useRouter();
  const { toast } = useToast();

  const [avatarItems, setAvatarItems] = useState<EditableAvatarItem[]>([]);
  const [rewardItems, setRewardItems] = useState<EditableRewardItem[]>([]);
  const [avatarBaseline, setAvatarBaseline] = useState<Record<string, string>>({});
  const [rewardBaseline, setRewardBaseline] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const serializeAvatarItem = (item: EditableAvatarItem) =>
    JSON.stringify({
      id: item.id,
      name: item.name,
      color: item.color,
      cost: item.cost,
      sortOrder: item.sortOrder,
      isDefault: item.isDefault,
      isActive: item.isActive,
      rarity: item.rarity,
      type: item.type,
    });

  const serializeRewardItem = (item: EditableRewardItem) =>
    JSON.stringify({
      id: item.id,
      title: item.title,
      description: item.description,
      cost: item.cost,
      rewardValue: item.rewardValue,
      stockTotal: item.stockTotal,
      stockRemaining: item.stockRemaining,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      type: item.type,
    });

  const handleUnauthorized = () => {
    toast({
      title: "Session expired",
      description: "Please sign in again on the parent dashboard.",
      variant: "destructive",
    });
    router.push("/parent");
  };

  const fetchJson = async (url: string, init?: RequestInit) => {
    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      throw new Error(payload?.error || "Request failed.");
    }

    return payload;
  };

  const loadCatalogs = async () => {
    setIsLoading(true);
    setIsRefreshing(true);
    setPageError(null);

    try {
      const [avatarPayload, rewardPayload] = await Promise.all([
        fetchJson("/api/admin/catalog/avatar"),
        fetchJson("/api/admin/catalog/rewards"),
      ]);

      setAvatarItems(avatarPayload.items || []);
      setRewardItems(rewardPayload.items || []);
      setAvatarBaseline(
        Object.fromEntries((avatarPayload.items || []).map((item: EditableAvatarItem) => [item.id, serializeAvatarItem(item)])),
      );
      setRewardBaseline(
        Object.fromEntries((rewardPayload.items || []).map((item: EditableRewardItem) => [item.id, serializeRewardItem(item)])),
      );
    } catch (error) {
      if (error instanceof Error && error.message !== "Unauthorized") {
        setPageError(error.message);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadCatalogs();
  }, []);

  const updateAvatarItem = (id: string, patch: Partial<EditableAvatarItem>) => {
    setAvatarItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const updateRewardItem = (id: string, patch: Partial<EditableRewardItem>) => {
    setRewardItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const saveAvatarItem = async (item: EditableAvatarItem) => {
    updateAvatarItem(item.id, { isSaving: true });

    try {
      await fetchJson("/api/admin/catalog/avatar", {
        method: "PUT",
        body: JSON.stringify(item),
      });
      toast({
        title: "Avatar item saved",
        description: `${item.name} has been updated.`,
      });
      setAvatarBaseline((current) => ({
        ...current,
        [item.id]: serializeAvatarItem(item),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save avatar item.";
      setPageError(message);
      toast({
        title: "Could not save avatar item",
        description: message,
        variant: "destructive",
      });
    } finally {
      updateAvatarItem(item.id, { isSaving: false });
    }
  };

  const saveRewardItem = async (item: EditableRewardItem) => {
    updateRewardItem(item.id, { isSaving: true });

    try {
      await fetchJson("/api/admin/catalog/rewards", {
        method: "PUT",
        body: JSON.stringify(item),
      });
      toast({
        title: "Reward saved",
        description: `${item.title} has been updated.`,
      });
      setRewardBaseline((current) => ({
        ...current,
        [item.id]: serializeRewardItem(item),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save reward.";
      setPageError(message);
      toast({
        title: "Could not save reward",
        description: message,
        variant: "destructive",
      });
    } finally {
      updateRewardItem(item.id, { isSaving: false });
    }
  };

  const isAvatarDirty = (item: EditableAvatarItem) =>
    avatarBaseline[item.id] !== undefined && avatarBaseline[item.id] !== serializeAvatarItem(item);

  const isRewardDirty = (item: EditableRewardItem) =>
    rewardBaseline[item.id] !== undefined && rewardBaseline[item.id] !== serializeRewardItem(item);

  const resetAvatarItem = (id: string) => {
    const baseline = avatarBaseline[id];
    if (!baseline) {
      return;
    }

    updateAvatarItem(id, {
      ...(JSON.parse(baseline) as EditableAvatarItem),
      isSaving: false,
    });
    setPageError(null);
  };

  const resetRewardItem = (id: string) => {
    const baseline = rewardBaseline[id];
    if (!baseline) {
      return;
    }

    updateRewardItem(id, {
      ...(JSON.parse(baseline) as EditableRewardItem),
      isSaving: false,
    });
    setPageError(null);
  };

  const pendingChanges =
    avatarItems.filter((item) => isAvatarDirty(item)).length + rewardItems.filter((item) => isRewardDirty(item)).length;

  return (
    <ParentWorkspaceShell
      currentSection="catalog"
      title="Catalog Controls"
      description="Shape the storefront with tighter controls for unlock pricing, stock pressure, and what stays visible to learners."
      icon={<Package2 className="h-6 w-6" />}
      actions={
        <>
          <Button asChild variant="outline" className="rounded-full border-slate-300/70 bg-white/60 dark:border-white/10 dark:bg-white/5">
            <Link href="/parent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <Button variant="outline" disabled={isRefreshing} className="rounded-full border-slate-300/70 bg-white/60 dark:border-white/10 dark:bg-white/5" onClick={() => void loadCatalogs()}>
            {isRefreshing ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Refreshing
              </span>
            ) : (
              "Refresh"
            )}
          </Button>
          <ThemeToggle />
        </>
      }
      metrics={[
        { label: "Avatar Items", value: `${avatarItems.length}` },
        { label: "Reward Entries", value: `${rewardItems.length}` },
        { label: "Active Rewards", value: `${rewardItems.filter((item) => item.isActive).length}` },
        { label: "Pending Changes", value: `${pendingChanges}` },
      ]}
    >
      <MotionGroup className="space-y-6">
        {pageError ? (
          <Alert variant="destructive" className="rounded-[1.5rem] border-red-200/80 bg-white/90 dark:border-red-500/30 dark:bg-red-950/20">
            <AlertTitle>Catalog update problem</AlertTitle>
            <AlertDescription>{pageError}</AlertDescription>
          </Alert>
        ) : null}

        {pendingChanges > 0 ? (
          <Alert className="rounded-[1.5rem] border-amber-200/80 bg-white/90 dark:border-amber-500/30 dark:bg-amber-950/20">
            <AlertTitle>Unsaved catalog changes</AlertTitle>
            <AlertDescription>
              {pendingChanges} item{pendingChanges === 1 ? "" : "s"} changed. Save or revert each card before leaving this workspace.
            </AlertDescription>
          </Alert>
        ) : null}

        <Tabs defaultValue="avatars" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2 rounded-full border border-white/70 bg-white/72 p-1 shadow-sm dark:border-white/10 dark:bg-slate-950/55">
            <TabsTrigger value="avatars">Avatar Items</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="avatars">
            <MotionItem>
              <Card className={workspacePanelClass}>
                <CardContent className="p-6">
                  <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="overflow-hidden rounded-[1.8rem] bg-[linear-gradient(135deg,#7d3cff_0%,#b35cff_56%,#f38bff_100%)] p-6 text-white shadow-[0_24px_60px_rgba(179,92,255,0.2)]">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-full bg-white/12 text-white">
                          Avatar Catalog
                        </Badge>
                        <Badge variant="secondary" className="rounded-full bg-white/10 text-white/80">
                          {avatarItems.length} items
                        </Badge>
                      </div>
                      <h2 className="font-display mt-5 text-3xl font-semibold md:text-4xl">
                        Tune what the learner sees, earns, and unlocks without losing catalog clarity.
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-white/82">
                        Cost, rarity, order, and visibility all live here so the avatar economy can stay coherent instead of drifting item by item.
                      </p>
                    </div>
                    <div className="grid gap-4">
                      <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/45">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Default unlocks</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{avatarItems.filter((item) => item.isDefault).length}</div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Track how much of the wardrobe is given away before progression begins.</p>
                      </div>
                      <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/45">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Active avatar items</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{avatarItems.filter((item) => item.isActive).length}</div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">A quick read on what is currently visible in the learner store.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </MotionItem>

            <Card className={workspacePanelClass}>
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2 text-slate-900">
                  <div className="rounded-2xl bg-fuchsia-100 p-2 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  Avatar Catalog
                </CardTitle>
                <CardDescription>
                  Adjust cost, rarity, default status, ordering, and whether an item appears in the store.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading avatar items...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {avatarItems.map((item) => (
                      <div key={item.id} className="rounded-[1.5rem] border border-slate-200/80 bg-white/60 p-5 dark:border-white/10 dark:bg-slate-900/40">
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="rounded-full bg-slate-900 text-white dark:bg-amber-300 dark:text-slate-950">{item.id}</Badge>
                          <Badge variant="outline" className="rounded-full">{item.type}</Badge>
                          <Badge variant="outline" className="rounded-full">{item.rarity}</Badge>
                          {isAvatarDirty(item) ? (
                            <Badge className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                              Unsaved
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-full border-emerald-200 text-emerald-700 dark:border-emerald-500/20 dark:text-emerald-300">
                              Synced
                            </Badge>
                          )}
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={item.name} onChange={(event) => updateAvatarItem(item.id, { name: event.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Color</Label>
                            <Input value={item.color} onChange={(event) => updateAvatarItem(item.id, { color: event.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Cost</Label>
                            <Input type="number" min={0} value={item.cost} onChange={(event) => updateAvatarItem(item.id, { cost: Number.parseInt(event.target.value, 10) || 0 })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Sort Order</Label>
                            <Input type="number" min={0} value={item.sortOrder} onChange={(event) => updateAvatarItem(item.id, { sortOrder: Number.parseInt(event.target.value, 10) || 0 })} />
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-6">
                          <label className="flex items-center gap-2 text-sm text-slate-700">
                            <Checkbox checked={item.isDefault} onCheckedChange={(checked) => updateAvatarItem(item.id, { isDefault: checked === true })} />
                            Default unlock
                          </label>
                          <label className="flex items-center gap-2 text-sm text-slate-700">
                            <Checkbox checked={item.isActive} onCheckedChange={(checked) => updateAvatarItem(item.id, { isActive: checked === true })} />
                            Active
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => resetAvatarItem(item.id)}
                            disabled={item.isSaving || !isAvatarDirty(item)}
                            className="rounded-full border-slate-300/80 bg-white/70 dark:border-white/10 dark:bg-white/5"
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Revert
                          </Button>
                          <Button onClick={() => void saveAvatarItem(item)} disabled={item.isSaving || !isAvatarDirty(item)} className="rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-amber-300 dark:text-slate-950 dark:hover:bg-amber-200">
                            {item.isSaving ? (
                              <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                              </span>
                            ) : isAvatarDirty(item) ? "Save Item" : "No Changes"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards">
            <MotionItem>
              <Card className={workspacePanelClass}>
                <CardContent className="p-6">
                  <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="overflow-hidden rounded-[1.8rem] bg-[linear-gradient(135deg,#10393f_0%,#1f8576_56%,#74c89c_100%)] p-6 text-white shadow-[0_24px_60px_rgba(31,133,118,0.18)]">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-full bg-white/12 text-white">
                          Reward Catalog
                        </Badge>
                        <Badge variant="secondary" className="rounded-full bg-white/10 text-white/80">
                          {rewardItems.length} rewards
                        </Badge>
                      </div>
                      <h2 className="font-display mt-5 text-3xl font-semibold md:text-4xl">
                        Control reward pressure, stock visibility, and pricing from one cleaner command surface.
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-white/82">
                        This keeps the reward economy understandable for both learners and parents instead of leaving pricing and stock to drift over time.
                      </p>
                    </div>
                    <div className="grid gap-4">
                      <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/45">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Active rewards</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{rewardItems.filter((item) => item.isActive).length}</div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">See how much of the reward store is currently live.</p>
                      </div>
                      <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/45">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Limited stock rewards</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{rewardItems.filter((item) => item.stockRemaining !== null).length}</div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">A fast read on which rewards need closer inventory monitoring.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </MotionItem>

            <Card className={workspacePanelClass}>
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2 text-slate-900">
                  <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <Package2 className="h-5 w-5" />
                  </div>
                  Reward Catalog
                </CardTitle>
                <CardDescription>
                  Control reward pricing, value, stock, sort order, and whether a reward is currently available.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading rewards...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rewardItems.map((item) => (
                      <div key={item.id} className="rounded-[1.5rem] border border-slate-200/80 bg-white/60 p-5 dark:border-white/10 dark:bg-slate-900/40">
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="rounded-full bg-slate-900 text-white dark:bg-amber-300 dark:text-slate-950">{item.id}</Badge>
                          <Badge variant="outline" className="rounded-full">{item.type}</Badge>
                          {isRewardDirty(item) ? (
                            <Badge className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                              Unsaved
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-full border-emerald-200 text-emerald-700 dark:border-emerald-500/20 dark:text-emerald-300">
                              Synced
                            </Badge>
                          )}
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          <div className="space-y-2 lg:col-span-2">
                            <Label>Title</Label>
                            <Input value={item.title} onChange={(event) => updateRewardItem(item.id, { title: event.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Cost</Label>
                            <Input type="number" min={0} value={item.cost} onChange={(event) => updateRewardItem(item.id, { cost: Number.parseInt(event.target.value, 10) || 0 })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Reward Value</Label>
                            <Input type="number" min={0} value={item.rewardValue} onChange={(event) => updateRewardItem(item.id, { rewardValue: Number.parseInt(event.target.value, 10) || 0 })} />
                          </div>
                          <div className="space-y-2 lg:col-span-4">
                            <Label>Description</Label>
                            <Input value={item.description} onChange={(event) => updateRewardItem(item.id, { description: event.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Stock Total</Label>
                            <Input type="number" min={0} value={item.stockTotal ?? ""} onChange={(event) => updateRewardItem(item.id, { stockTotal: event.target.value === "" ? null : Number.parseInt(event.target.value, 10) || 0 })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Stock Remaining</Label>
                            <Input type="number" min={0} value={item.stockRemaining ?? ""} onChange={(event) => updateRewardItem(item.id, { stockRemaining: event.target.value === "" ? null : Number.parseInt(event.target.value, 10) || 0 })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Sort Order</Label>
                            <Input type="number" min={0} value={item.sortOrder} onChange={(event) => updateRewardItem(item.id, { sortOrder: Number.parseInt(event.target.value, 10) || 0 })} />
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-6">
                          <label className="flex items-center gap-2 text-sm text-slate-700">
                            <Checkbox checked={item.isActive} onCheckedChange={(checked) => updateRewardItem(item.id, { isActive: checked === true })} />
                            Active
                          </label>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => resetRewardItem(item.id)}
                            disabled={item.isSaving || !isRewardDirty(item)}
                            className="rounded-full border-slate-300/80 bg-white/70 dark:border-white/10 dark:bg-white/5"
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Revert
                          </Button>
                          <Button onClick={() => void saveRewardItem(item)} disabled={item.isSaving || !isRewardDirty(item)} className="rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-amber-300 dark:text-slate-950 dark:hover:bg-amber-200">
                            {item.isSaving ? (
                              <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                              </span>
                            ) : isRewardDirty(item) ? "Save Reward" : "No Changes"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </MotionGroup>
    </ParentWorkspaceShell>
  );
}
