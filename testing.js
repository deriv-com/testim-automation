!(function (e, t) {
  "object" == typeof exports && "object" == typeof module
    ? (module.exports = t())
    : "function" == typeof define && define.amd
    ? define([], t)
    : "object" == typeof exports
    ? (exports.Analytics = t())
    : (e.Analytics = t());
})(this, () =>
  (() => {
    var e = {
        328: (e, t, r) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.GrowthBook = void 0),
            (t.prefetchPayload = async function (e) {
              const t = new c(e);
              await (0, a.refreshFeatures)({
                instance: t,
                skipCache: e.skipCache,
                allowStale: !1,
                backgroundSync: e.streaming,
              }),
                t.destroy();
            });
          var n,
            i = (n = r(591)) && n.__esModule ? n : { default: n },
            s = r(106),
            o = r(427),
            a = r(707);
          const l =
              "undefined" != typeof window && "undefined" != typeof document,
            u = (0, s.loadSDKVersion)();
          class c {
            constructor(e) {
              if (
                ((e = e || {}),
                (this.version = u),
                (this._ctx = this.context = e),
                (this._renderer = e.renderer || null),
                (this._trackedExperiments = new Set()),
                (this._completedChangeIds = new Set()),
                (this._trackedFeatures = {}),
                (this.debug = !!e.debug),
                (this._subscriptions = new Set()),
                (this._rtQueue = []),
                (this._rtTimer = 0),
                (this.ready = !1),
                (this._assigned = new Map()),
                (this._forcedFeatureValues = new Map()),
                (this._attributeOverrides = {}),
                (this._activeAutoExperiments = new Map()),
                (this._triggeredExpKeys = new Set()),
                (this._initialized = !1),
                (this._redirectedUrl = ""),
                (this._deferredTrackingCalls = new Map()),
                (this._autoExperimentsAllowed = !e.disableExperimentsOnLoad),
                e.remoteEval)
              ) {
                if (e.decryptionKey)
                  throw new Error("Encryption is not available for remoteEval");
                if (!e.clientKey) throw new Error("Missing clientKey");
                let t = !1;
                try {
                  t = !!new URL(e.apiHost || "").hostname.match(
                    /growthbook\.io$/i
                  );
                } catch (e) {}
                if (t)
                  throw new Error("Cannot use remoteEval on GrowthBook Cloud");
              } else if (e.cacheKeyAttributes)
                throw new Error(
                  "cacheKeyAttributes are only used for remoteEval"
                );
              if (
                (e.features && (this.ready = !0),
                l &&
                  e.enableDevMode &&
                  ((window._growthbook = this),
                  document.dispatchEvent(new Event("gbloaded"))),
                e.experiments
                  ? ((this.ready = !0), this._updateAllAutoExperiments())
                  : e.antiFlicker && this._setAntiFlicker(),
                this._ctx.stickyBucketService &&
                  this._ctx.stickyBucketAssignmentDocs)
              )
                for (const e in this._ctx.stickyBucketAssignmentDocs) {
                  const t = this._ctx.stickyBucketAssignmentDocs[e];
                  t &&
                    this._ctx.stickyBucketService
                      .saveAssignments(t)
                      .catch(() => {});
                }
              this.ready && this.refreshStickyBuckets(this.getPayload());
            }
            async setPayload(e) {
              this._payload = e;
              const t = await this.decryptPayload(e);
              (this._decryptedPayload = t),
                await this.refreshStickyBuckets(t),
                t.features && (this._ctx.features = t.features),
                t.savedGroups && (this._ctx.savedGroups = t.savedGroups),
                t.experiments &&
                  ((this._ctx.experiments = t.experiments),
                  this._updateAllAutoExperiments()),
                (this.ready = !0),
                this._render();
            }
            initSync(e) {
              this._initialized = !0;
              const t = e.payload;
              if (t.encryptedExperiments || t.encryptedFeatures)
                throw new Error("initSync does not support encrypted payloads");
              if (
                this._ctx.stickyBucketService &&
                !this._ctx.stickyBucketAssignmentDocs
              )
                throw new Error(
                  "initSync requires you to pass stickyBucketAssignmentDocs into the GrowthBook constructor"
                );
              if (
                ((this._payload = t),
                (this._decryptedPayload = t),
                t.features && (this._ctx.features = t.features),
                t.experiments &&
                  ((this._ctx.experiments = t.experiments),
                  this._updateAllAutoExperiments()),
                (this.ready = !0),
                e.streaming)
              ) {
                if (!this._ctx.clientKey)
                  throw new Error("Must specify clientKey to enable streaming");
                (0, a.startAutoRefresh)(this, !0), (0, a.subscribe)(this);
              }
              return this;
            }
            async init(e) {
              if (((this._initialized = !0), (e = e || {}).payload)) {
                if ((await this.setPayload(e.payload), e.streaming)) {
                  if (!this._ctx.clientKey)
                    throw new Error(
                      "Must specify clientKey to enable streaming"
                    );
                  (0, a.startAutoRefresh)(this, !0), (0, a.subscribe)(this);
                }
                return { success: !0, source: "init" };
              }
              {
                const { data: t, ...r } = await this._refresh({
                  ...e,
                  allowStale: !0,
                });
                return (
                  e.streaming && (0, a.subscribe)(this),
                  await this.setPayload(t || {}),
                  r
                );
              }
            }
            async loadFeatures(e) {
              (this._initialized = !0),
                (e = e || {}).autoRefresh &&
                  (this._ctx.subscribeToChanges = !0);
              const { data: t } = await this._refresh({ ...e, allowStale: !0 });
              await this.setPayload(t || {}),
                this._canSubscribe() && (0, a.subscribe)(this);
            }
            async refreshFeatures(e) {
              const t = await this._refresh({ ...(e || {}), allowStale: !1 });
              t.data && (await this.setPayload(t.data));
            }
            getApiInfo() {
              return [this.getApiHosts().apiHost, this.getClientKey()];
            }
            getApiHosts() {
              const e = this._ctx.apiHost || "https://cdn.growthbook.io";
              return {
                apiHost: e.replace(/\/*$/, ""),
                streamingHost: (this._ctx.streamingHost || e).replace(
                  /\/*$/,
                  ""
                ),
                apiRequestHeaders: this._ctx.apiHostRequestHeaders,
                streamingHostRequestHeaders:
                  this._ctx.streamingHostRequestHeaders,
              };
            }
            getClientKey() {
              return this._ctx.clientKey || "";
            }
            getPayload() {
              return (
                this._payload || {
                  features: this.getFeatures(),
                  experiments: this.getExperiments(),
                }
              );
            }
            getDecryptedPayload() {
              return this._decryptedPayload || this.getPayload();
            }
            isRemoteEval() {
              return this._ctx.remoteEval || !1;
            }
            getCacheKeyAttributes() {
              return this._ctx.cacheKeyAttributes;
            }
            async _refresh(e) {
              var t;
              let { timeout: r, skipCache: n, allowStale: i, streaming: s } = e;
              if (!this._ctx.clientKey) throw new Error("Missing clientKey");
              return (0, a.refreshFeatures)({
                instance: this,
                timeout: r,
                skipCache: n || this._ctx.disableCache,
                allowStale: i,
                backgroundSync:
                  null === (t = null != s ? s : this._ctx.backgroundSync) ||
                  void 0 === t ||
                  t,
              });
            }
            _render() {
              if (this._renderer)
                try {
                  this._renderer();
                } catch (e) {
                  console.error("Failed to render", e);
                }
            }
            setFeatures(e) {
              (this._ctx.features = e), (this.ready = !0), this._render();
            }
            async setEncryptedFeatures(e, t, r) {
              const n = await (0, s.decrypt)(
                e,
                t || this._ctx.decryptionKey,
                r
              );
              this.setFeatures(JSON.parse(n));
            }
            setExperiments(e) {
              (this._ctx.experiments = e),
                (this.ready = !0),
                this._updateAllAutoExperiments();
            }
            async setEncryptedExperiments(e, t, r) {
              const n = await (0, s.decrypt)(
                e,
                t || this._ctx.decryptionKey,
                r
              );
              this.setExperiments(JSON.parse(n));
            }
            async decryptPayload(e, t, r) {
              if ((e = { ...e }).encryptedFeatures) {
                try {
                  e.features = JSON.parse(
                    await (0, s.decrypt)(
                      e.encryptedFeatures,
                      t || this._ctx.decryptionKey,
                      r
                    )
                  );
                } catch (e) {
                  console.error(e);
                }
                delete e.encryptedFeatures;
              }
              if (e.encryptedExperiments) {
                try {
                  e.experiments = JSON.parse(
                    await (0, s.decrypt)(
                      e.encryptedExperiments,
                      t || this._ctx.decryptionKey,
                      r
                    )
                  );
                } catch (e) {
                  console.error(e);
                }
                delete e.encryptedExperiments;
              }
              if (e.encryptedSavedGroups) {
                try {
                  e.savedGroups = JSON.parse(
                    await (0, s.decrypt)(
                      e.encryptedSavedGroups,
                      t || this._ctx.decryptionKey,
                      r
                    )
                  );
                } catch (e) {
                  console.error(e);
                }
                delete e.encryptedSavedGroups;
              }
              return e;
            }
            async setAttributes(e) {
              (this._ctx.attributes = e),
                this._ctx.stickyBucketService &&
                  (await this.refreshStickyBuckets()),
                this._ctx.remoteEval
                  ? await this._refreshForRemoteEval()
                  : (this._render(), this._updateAllAutoExperiments());
            }
            async updateAttributes(e) {
              return this.setAttributes({ ...this._ctx.attributes, ...e });
            }
            async setAttributeOverrides(e) {
              (this._attributeOverrides = e),
                this._ctx.stickyBucketService &&
                  (await this.refreshStickyBuckets()),
                this._ctx.remoteEval
                  ? await this._refreshForRemoteEval()
                  : (this._render(), this._updateAllAutoExperiments());
            }
            async setForcedVariations(e) {
              (this._ctx.forcedVariations = e || {}),
                this._ctx.remoteEval
                  ? await this._refreshForRemoteEval()
                  : (this._render(), this._updateAllAutoExperiments());
            }
            setForcedFeatures(e) {
              (this._forcedFeatureValues = e), this._render();
            }
            async setURL(e) {
              if (
                ((this._ctx.url = e),
                (this._redirectedUrl = ""),
                this._ctx.remoteEval)
              )
                return (
                  await this._refreshForRemoteEval(),
                  void this._updateAllAutoExperiments(!0)
                );
              this._updateAllAutoExperiments(!0);
            }
            getAttributes() {
              return { ...this._ctx.attributes, ...this._attributeOverrides };
            }
            getForcedVariations() {
              return this._ctx.forcedVariations || {};
            }
            getForcedFeatures() {
              return this._forcedFeatureValues || new Map();
            }
            getStickyBucketAssignmentDocs() {
              return this._ctx.stickyBucketAssignmentDocs || {};
            }
            getUrl() {
              return this._ctx.url || "";
            }
            getFeatures() {
              return this._ctx.features || {};
            }
            getExperiments() {
              return this._ctx.experiments || [];
            }
            getCompletedChangeIds() {
              return Array.from(this._completedChangeIds);
            }
            subscribe(e) {
              return (
                this._subscriptions.add(e),
                () => {
                  this._subscriptions.delete(e);
                }
              );
            }
            _canSubscribe() {
              var e;
              return (
                (null === (e = this._ctx.backgroundSync) ||
                  void 0 === e ||
                  e) &&
                this._ctx.subscribeToChanges
              );
            }
            async _refreshForRemoteEval() {
              if (!this._ctx.remoteEval) return;
              if (!this._initialized) return;
              const e = await this._refresh({ allowStale: !1 });
              e.data && (await this.setPayload(e.data));
            }
            getAllResults() {
              return new Map(this._assigned);
            }
            destroy() {
              this._subscriptions.clear(),
                this._assigned.clear(),
                this._trackedExperiments.clear(),
                this._completedChangeIds.clear(),
                this._deferredTrackingCalls.clear(),
                (this._trackedFeatures = {}),
                (this._rtQueue = []),
                (this._payload = void 0),
                this._rtTimer && clearTimeout(this._rtTimer),
                (0, a.unsubscribe)(this),
                l && window._growthbook === this && delete window._growthbook,
                this._activeAutoExperiments.forEach((e) => {
                  e.undo();
                }),
                this._activeAutoExperiments.clear(),
                this._triggeredExpKeys.clear();
            }
            setRenderer(e) {
              this._renderer = e;
            }
            forceVariation(e, t) {
              (this._ctx.forcedVariations = this._ctx.forcedVariations || {}),
                (this._ctx.forcedVariations[e] = t),
                this._ctx.remoteEval
                  ? this._refreshForRemoteEval()
                  : (this._updateAllAutoExperiments(), this._render());
            }
            run(e) {
              const t = this._run(e, null);
              return this._fireSubscriptions(e, t), t;
            }
            triggerExperiment(e) {
              return (
                this._triggeredExpKeys.add(e),
                this._ctx.experiments
                  ? this._ctx.experiments
                      .filter((t) => t.key === e)
                      .map((e) => this._runAutoExperiment(e))
                      .filter((e) => null !== e)
                  : null
              );
            }
            triggerAutoExperiments() {
              (this._autoExperimentsAllowed = !0),
                this._updateAllAutoExperiments(!0);
            }
            _runAutoExperiment(e, t) {
              const r = this._activeAutoExperiments.get(e);
              if (e.manual && !this._triggeredExpKeys.has(e.key) && !r)
                return null;
              const n = this._isAutoExperimentBlockedByContext(e)
                  ? this._getResult(e, -1, !1, "")
                  : this.run(e),
                i = JSON.stringify(n.value);
              if (!t && n.inExperiment && r && r.valueHash === i) return n;
              if ((r && this._undoActiveAutoExperiment(e), n.inExperiment)) {
                const t = (0, s.getAutoExperimentChangeType)(e);
                if ("redirect" === t && n.value.urlRedirect && e.urlPatterns) {
                  const t = e.persistQueryString
                    ? (0, s.mergeQueryStrings)(
                        this._getContextUrl(),
                        n.value.urlRedirect
                      )
                    : n.value.urlRedirect;
                  if ((0, s.isURLTargeted)(t, e.urlPatterns))
                    return (
                      this.log(
                        "Skipping redirect because original URL matches redirect URL",
                        { id: e.key }
                      ),
                      n
                    );
                  this._redirectedUrl = t;
                  const r = this._getNavigateFunction();
                  var o;
                  if (r)
                    if (l)
                      this._setAntiFlicker(),
                        window.setTimeout(
                          () => {
                            try {
                              r(t);
                            } catch (e) {
                              console.error(e);
                            }
                          },
                          null !== (o = this._ctx.navigateDelay) && void 0 !== o
                            ? o
                            : 100
                        );
                    else
                      try {
                        r(t);
                      } catch (e) {
                        console.error(e);
                      }
                } else if ("visual" === t) {
                  const t = this._ctx.applyDomChangesCallback
                    ? this._ctx.applyDomChangesCallback(n.value)
                    : this._applyDOMChanges(n.value);
                  t &&
                    this._activeAutoExperiments.set(e, {
                      undo: t,
                      valueHash: i,
                    });
                }
              }
              return n;
            }
            _undoActiveAutoExperiment(e) {
              const t = this._activeAutoExperiments.get(e);
              t && (t.undo(), this._activeAutoExperiments.delete(e));
            }
            _updateAllAutoExperiments(e) {
              if (!this._autoExperimentsAllowed) return;
              const t = this._ctx.experiments || [],
                r = new Set(t);
              this._activeAutoExperiments.forEach((e, t) => {
                r.has(t) || (e.undo(), this._activeAutoExperiments.delete(t));
              });
              for (const r of t) {
                const t = this._runAutoExperiment(r, e);
                if (
                  null != t &&
                  t.inExperiment &&
                  "redirect" === (0, s.getAutoExperimentChangeType)(r)
                )
                  break;
              }
            }
            _fireSubscriptions(e, t) {
              const r = e.key,
                n = this._assigned.get(r);
              (n &&
                n.result.inExperiment === t.inExperiment &&
                n.result.variationId === t.variationId) ||
                (this._assigned.set(r, { experiment: e, result: t }),
                this._subscriptions.forEach((r) => {
                  try {
                    r(e, t);
                  } catch (e) {
                    console.error(e);
                  }
                }));
            }
            _trackFeatureUsage(e, t) {
              if ("override" === t.source) return;
              const r = JSON.stringify(t.value);
              if (this._trackedFeatures[e] !== r) {
                if (((this._trackedFeatures[e] = r), this._ctx.onFeatureUsage))
                  try {
                    this._ctx.onFeatureUsage(e, t);
                  } catch (e) {}
                l &&
                  window.fetch &&
                  (this._rtQueue.push({ key: e, on: t.on }),
                  this._rtTimer ||
                    (this._rtTimer = window.setTimeout(() => {
                      this._rtTimer = 0;
                      const e = [...this._rtQueue];
                      (this._rtQueue = []),
                        this._ctx.realtimeKey &&
                          window
                            .fetch(
                              "https://rt.growthbook.io/?key="
                                .concat(this._ctx.realtimeKey, "&events=")
                                .concat(encodeURIComponent(JSON.stringify(e))),
                              { cache: "no-cache", mode: "no-cors" }
                            )
                            .catch(() => {});
                    }, this._ctx.realtimeInterval || 2e3)));
              }
            }
            _getFeatureResult(e, t, r, n, i, s) {
              const o = {
                value: t,
                on: !!t,
                off: !t,
                source: r,
                ruleId: n || "",
              };
              return (
                i && (o.experiment = i),
                s && (o.experimentResult = s),
                this._trackFeatureUsage(e, o),
                o
              );
            }
            isOn(e) {
              return this.evalFeature(e).on;
            }
            isOff(e) {
              return this.evalFeature(e).off;
            }
            getFeatureValue(e, t) {
              const r = this.evalFeature(e).value;
              return null === r ? t : r;
            }
            feature(e) {
              return this.evalFeature(e);
            }
            evalFeature(e) {
              return this._evalFeature(e);
            }
            _evalFeature(e, t) {
              if (
                (t = t || {
                  evaluatedFeatures: new Set(),
                }).evaluatedFeatures.has(e)
              )
                return this._getFeatureResult(e, null, "cyclicPrerequisite");
              if (
                (t.evaluatedFeatures.add(e),
                (t.id = e),
                this._forcedFeatureValues.has(e))
              )
                return this._getFeatureResult(
                  e,
                  this._forcedFeatureValues.get(e),
                  "override"
                );
              if (!this._ctx.features || !this._ctx.features[e])
                return this._getFeatureResult(e, null, "unknownFeature");
              const r = this._ctx.features[e];
              if (r.rules)
                e: for (const n of r.rules) {
                  if (n.parentConditions)
                    for (const r of n.parentConditions) {
                      const n = this._evalFeature(r.id, t);
                      if ("cyclicPrerequisite" === n.source)
                        return this._getFeatureResult(
                          e,
                          null,
                          "cyclicPrerequisite"
                        );
                      const i = { value: n.value };
                      if (!(0, o.evalCondition)(i, r.condition || {})) {
                        if (r.gate)
                          return this._getFeatureResult(
                            e,
                            null,
                            "prerequisite"
                          );
                        continue e;
                      }
                    }
                  if (n.filters && this._isFilteredOut(n.filters)) continue;
                  if ("force" in n) {
                    if (n.condition && !this._conditionPasses(n.condition))
                      continue;
                    if (
                      !this._isIncludedInRollout(
                        n.seed || e,
                        n.hashAttribute,
                        this._ctx.stickyBucketService &&
                          !n.disableStickyBucketing
                          ? n.fallbackAttribute
                          : void 0,
                        n.range,
                        n.coverage,
                        n.hashVersion
                      )
                    )
                      continue;
                    return (
                      n.tracks &&
                        n.tracks.forEach((e) => {
                          this._track(e.experiment, e.result);
                        }),
                      this._getFeatureResult(e, n.force, "force", n.id)
                    );
                  }
                  if (!n.variations) continue;
                  const r = { variations: n.variations, key: n.key || e };
                  "coverage" in n && (r.coverage = n.coverage),
                    n.weights && (r.weights = n.weights),
                    n.hashAttribute && (r.hashAttribute = n.hashAttribute),
                    n.fallbackAttribute &&
                      (r.fallbackAttribute = n.fallbackAttribute),
                    n.disableStickyBucketing &&
                      (r.disableStickyBucketing = n.disableStickyBucketing),
                    void 0 !== n.bucketVersion &&
                      (r.bucketVersion = n.bucketVersion),
                    void 0 !== n.minBucketVersion &&
                      (r.minBucketVersion = n.minBucketVersion),
                    n.namespace && (r.namespace = n.namespace),
                    n.meta && (r.meta = n.meta),
                    n.ranges && (r.ranges = n.ranges),
                    n.name && (r.name = n.name),
                    n.phase && (r.phase = n.phase),
                    n.seed && (r.seed = n.seed),
                    n.hashVersion && (r.hashVersion = n.hashVersion),
                    n.filters && (r.filters = n.filters),
                    n.condition && (r.condition = n.condition);
                  const i = this._run(r, e);
                  if (
                    (this._fireSubscriptions(r, i),
                    i.inExperiment && !i.passthrough)
                  )
                    return this._getFeatureResult(
                      e,
                      i.value,
                      "experiment",
                      n.id,
                      r,
                      i
                    );
                }
              return this._getFeatureResult(
                e,
                void 0 === r.defaultValue ? null : r.defaultValue,
                "defaultValue"
              );
            }
            _isIncludedInRollout(e, t, r, n, i, o) {
              if (!n && void 0 === i) return !0;
              if (!n && 0 === i) return !1;
              const { hashValue: a } = this._getHashAttribute(t, r);
              if (!a) return !1;
              const l = (0, s.hash)(e, a, o || 1);
              return (
                null !== l &&
                (n ? (0, s.inRange)(l, n) : void 0 === i || l <= i)
              );
            }
            _conditionPasses(e) {
              return (0, o.evalCondition)(
                this.getAttributes(),
                e,
                this._ctx.savedGroups || {}
              );
            }
            _isFilteredOut(e) {
              return e.some((e) => {
                const { hashValue: t } = this._getHashAttribute(e.attribute);
                if (!t) return !0;
                const r = (0, s.hash)(e.seed, t, e.hashVersion || 2);
                return (
                  null === r || !e.ranges.some((e) => (0, s.inRange)(r, e))
                );
              });
            }
            _run(e, t) {
              const r = e.key,
                n = e.variations.length;
              if (n < 2) return this._getResult(e, -1, !1, t);
              if (!1 === this._ctx.enabled)
                return this._getResult(e, -1, !1, t);
              if (
                (e = this._mergeOverrides(e)).urlPatterns &&
                !(0, s.isURLTargeted)(this._getContextUrl(), e.urlPatterns)
              )
                return this._getResult(e, -1, !1, t);
              const i = (0, s.getQueryStringOverride)(
                r,
                this._getContextUrl(),
                n
              );
              if (null !== i) return this._getResult(e, i, !1, t);
              if (
                this._ctx.forcedVariations &&
                r in this._ctx.forcedVariations
              ) {
                const n = this._ctx.forcedVariations[r];
                return this._getResult(e, n, !1, t);
              }
              if ("draft" === e.status || !1 === e.active)
                return this._getResult(e, -1, !1, t);
              const { hashAttribute: a, hashValue: l } = this._getHashAttribute(
                e.hashAttribute,
                this._ctx.stickyBucketService && !e.disableStickyBucketing
                  ? e.fallbackAttribute
                  : void 0
              );
              if (!l) return this._getResult(e, -1, !1, t);
              let u = -1,
                c = !1,
                d = !1;
              if (this._ctx.stickyBucketService && !e.disableStickyBucketing) {
                const { variation: t, versionIsBlocked: r } =
                  this._getStickyBucketVariation({
                    expKey: e.key,
                    expBucketVersion: e.bucketVersion,
                    expHashAttribute: e.hashAttribute,
                    expFallbackAttribute: e.fallbackAttribute,
                    expMinBucketVersion: e.minBucketVersion,
                    expMeta: e.meta,
                  });
                (c = t >= 0), (u = t), (d = !!r);
              }
              if (!c) {
                if (e.filters) {
                  if (this._isFilteredOut(e.filters))
                    return this._getResult(e, -1, !1, t);
                } else if (e.namespace && !(0, s.inNamespace)(l, e.namespace))
                  return this._getResult(e, -1, !1, t);
                if (e.include && !(0, s.isIncluded)(e.include))
                  return this._getResult(e, -1, !1, t);
                if (e.condition && !this._conditionPasses(e.condition))
                  return this._getResult(e, -1, !1, t);
                if (e.parentConditions)
                  for (const r of e.parentConditions) {
                    const n = this._evalFeature(r.id);
                    if ("cyclicPrerequisite" === n.source)
                      return this._getResult(e, -1, !1, t);
                    const i = { value: n.value };
                    if (!(0, o.evalCondition)(i, r.condition || {}))
                      return this._getResult(e, -1, !1, t);
                  }
                if (e.groups && !this._hasGroupOverlap(e.groups))
                  return this._getResult(e, -1, !1, t);
              }
              if (e.url && !this._urlIsValid(e.url))
                return this._getResult(e, -1, !1, t);
              const h = (0, s.hash)(e.seed || r, l, e.hashVersion || 1);
              if (null === h) return this._getResult(e, -1, !1, t);
              if (!c) {
                const t =
                  e.ranges ||
                  (0, s.getBucketRanges)(
                    n,
                    void 0 === e.coverage ? 1 : e.coverage,
                    e.weights
                  );
                u = (0, s.chooseVariation)(h, t);
              }
              if (d) return this._getResult(e, -1, !1, t, void 0, !0);
              if (u < 0) return this._getResult(e, -1, !1, t);
              if ("force" in e)
                return this._getResult(
                  e,
                  void 0 === e.force ? -1 : e.force,
                  !1,
                  t
                );
              if (this._ctx.qaMode) return this._getResult(e, -1, !1, t);
              if ("stopped" === e.status) return this._getResult(e, -1, !1, t);
              const g = this._getResult(e, u, !0, t, h, c);
              if (this._ctx.stickyBucketService && !e.disableStickyBucketing) {
                const {
                  changed: t,
                  key: r,
                  doc: n,
                } = this._generateStickyBucketAssignmentDoc(
                  a,
                  (0, s.toString)(l),
                  {
                    [this._getStickyBucketExperimentKey(
                      e.key,
                      e.bucketVersion
                    )]: g.key,
                  }
                );
                t &&
                  ((this._ctx.stickyBucketAssignmentDocs =
                    this._ctx.stickyBucketAssignmentDocs || {}),
                  (this._ctx.stickyBucketAssignmentDocs[r] = n),
                  this._ctx.stickyBucketService.saveAssignments(n));
              }
              return (
                this._track(e, g),
                "changeId" in e &&
                  e.changeId &&
                  this._completedChangeIds.add(e.changeId),
                g
              );
            }
            log(e, t) {
              this.debug &&
                (this._ctx.log ? this._ctx.log(e, t) : console.log(e, t));
            }
            getDeferredTrackingCalls() {
              return Array.from(this._deferredTrackingCalls.values());
            }
            setDeferredTrackingCalls(e) {
              this._deferredTrackingCalls = new Map(
                e
                  .filter((e) => e && e.experiment && e.result)
                  .map((e) => [this._getTrackKey(e.experiment, e.result), e])
              );
            }
            fireDeferredTrackingCalls() {
              this._ctx.trackingCallback &&
                (this._deferredTrackingCalls.forEach((e) => {
                  e && e.experiment && e.result
                    ? this._track(e.experiment, e.result)
                    : console.error("Invalid deferred tracking call", {
                        call: e,
                      });
                }),
                this._deferredTrackingCalls.clear());
            }
            setTrackingCallback(e) {
              (this._ctx.trackingCallback = e),
                this.fireDeferredTrackingCalls();
            }
            _getTrackKey(e, t) {
              return t.hashAttribute + t.hashValue + e.key + t.variationId;
            }
            _track(e, t) {
              const r = this._getTrackKey(e, t);
              if (this._ctx.trackingCallback) {
                if (!this._trackedExperiments.has(r)) {
                  this._trackedExperiments.add(r);
                  try {
                    this._ctx.trackingCallback(e, t);
                  } catch (e) {
                    console.error(e);
                  }
                }
              } else
                this._deferredTrackingCalls.has(r) ||
                  this._deferredTrackingCalls.set(r, {
                    experiment: e,
                    result: t,
                  });
            }
            _mergeOverrides(e) {
              const t = e.key,
                r = this._ctx.overrides;
              return (
                r &&
                  r[t] &&
                  "string" == typeof (e = Object.assign({}, e, r[t])).url &&
                  (e.url = (0, s.getUrlRegExp)(e.url)),
                e
              );
            }
            _getHashAttribute(e, t) {
              let r = e || "id",
                n = "";
              return (
                this._attributeOverrides[r]
                  ? (n = this._attributeOverrides[r])
                  : this._ctx.attributes
                  ? (n = this._ctx.attributes[r] || "")
                  : this._ctx.user && (n = this._ctx.user[r] || ""),
                !n &&
                  t &&
                  (this._attributeOverrides[t]
                    ? (n = this._attributeOverrides[t])
                    : this._ctx.attributes
                    ? (n = this._ctx.attributes[t] || "")
                    : this._ctx.user && (n = this._ctx.user[t] || ""),
                  n && (r = t)),
                { hashAttribute: r, hashValue: n }
              );
            }
            _getResult(e, t, r, n, i, s) {
              let o = !0;
              (t < 0 || t >= e.variations.length) && ((t = 0), (o = !1));
              const { hashAttribute: a, hashValue: l } = this._getHashAttribute(
                  e.hashAttribute,
                  this._ctx.stickyBucketService && !e.disableStickyBucketing
                    ? e.fallbackAttribute
                    : void 0
                ),
                u = e.meta ? e.meta[t] : {},
                c = {
                  key: u.key || "" + t,
                  featureId: n,
                  inExperiment: o,
                  hashUsed: r,
                  variationId: t,
                  value: e.variations[t],
                  hashAttribute: a,
                  hashValue: l,
                  stickyBucketUsed: !!s,
                };
              return (
                u.name && (c.name = u.name),
                void 0 !== i && (c.bucket = i),
                u.passthrough && (c.passthrough = u.passthrough),
                c
              );
            }
            _getContextUrl() {
              return this._ctx.url || (l ? window.location.href : "");
            }
            _urlIsValid(e) {
              const t = this._getContextUrl();
              if (!t) return !1;
              const r = t.replace(/^https?:\/\//, "").replace(/^[^/]*\//, "/");
              return !!e.test(t) || !!e.test(r);
            }
            _hasGroupOverlap(e) {
              const t = this._ctx.groups || {};
              for (let r = 0; r < e.length; r++) if (t[e[r]]) return !0;
              return !1;
            }
            _isAutoExperimentBlockedByContext(e) {
              const t = (0, s.getAutoExperimentChangeType)(e);
              if ("visual" === t) {
                if (this._ctx.disableVisualExperiments) return !0;
                if (
                  this._ctx.disableJsInjection &&
                  e.variations.some((e) => e.js)
                )
                  return !0;
              } else {
                if ("redirect" !== t) return !0;
                if (this._ctx.disableUrlRedirectExperiments) return !0;
                try {
                  const t = new URL(this._getContextUrl());
                  for (const r of e.variations) {
                    if (!r || !r.urlRedirect) continue;
                    const e = new URL(r.urlRedirect);
                    if (this._ctx.disableCrossOriginUrlRedirectExperiments) {
                      if (e.protocol !== t.protocol) return !0;
                      if (e.host !== t.host) return !0;
                    }
                  }
                } catch (t) {
                  return (
                    this.log("Error parsing current or redirect URL", {
                      id: e.key,
                      error: t,
                    }),
                    !0
                  );
                }
              }
              return !(
                !e.changeId ||
                !(this._ctx.blockedChangeIds || []).includes(e.changeId)
              );
            }
            getRedirectUrl() {
              return this._redirectedUrl;
            }
            _getNavigateFunction() {
              return this._ctx.navigate
                ? this._ctx.navigate
                : l
                ? (e) => {
                    window.location.replace(e);
                  }
                : null;
            }
            _setAntiFlicker() {
              if (this._ctx.antiFlicker && l)
                try {
                  var e;
                  const t = document.createElement("style");
                  (t.innerHTML =
                    ".gb-anti-flicker { opacity: 0 !important; pointer-events: none; }"),
                    document.head.appendChild(t),
                    document.documentElement.classList.add("gb-anti-flicker"),
                    setTimeout(
                      () => {
                        document.documentElement.classList.remove(
                          "gb-anti-flicker"
                        );
                      },
                      null !== (e = this._ctx.antiFlickerTimeout) &&
                        void 0 !== e
                        ? e
                        : 3500
                    );
                } catch (e) {
                  console.error(e);
                }
            }
            _applyDOMChanges(e) {
              if (!l) return;
              const t = [];
              if (e.css) {
                const r = document.createElement("style");
                (r.innerHTML = e.css),
                  document.head.appendChild(r),
                  t.push(() => r.remove());
              }
              if (e.js) {
                const r = document.createElement("script");
                (r.innerHTML = e.js),
                  this._ctx.jsInjectionNonce &&
                    (r.nonce = this._ctx.jsInjectionNonce),
                  document.head.appendChild(r),
                  t.push(() => r.remove());
              }
              return (
                e.domMutations &&
                  e.domMutations.forEach((e) => {
                    t.push(i.default.declarative(e).revert);
                  }),
                () => {
                  t.forEach((e) => e());
                }
              );
            }
            _deriveStickyBucketIdentifierAttributes(e) {
              const t = new Set(),
                r = e && e.features ? e.features : this.getFeatures(),
                n = e && e.experiments ? e.experiments : this.getExperiments();
              return (
                Object.keys(r).forEach((e) => {
                  const n = r[e];
                  if (n.rules)
                    for (const e of n.rules)
                      e.variations &&
                        (t.add(e.hashAttribute || "id"),
                        e.fallbackAttribute && t.add(e.fallbackAttribute));
                }),
                n.map((e) => {
                  t.add(e.hashAttribute || "id"),
                    e.fallbackAttribute && t.add(e.fallbackAttribute);
                }),
                Array.from(t)
              );
            }
            async refreshStickyBuckets(e) {
              if (this._ctx.stickyBucketService) {
                const t = this._getStickyBucketAttributes(e);
                this._ctx.stickyBucketAssignmentDocs =
                  await this._ctx.stickyBucketService.getAllAssignments(t);
              }
            }
            _getStickyBucketAssignments(e, t) {
              if (!this._ctx.stickyBucketAssignmentDocs) return {};
              const { hashAttribute: r, hashValue: n } =
                  this._getHashAttribute(e),
                i = "".concat(r, "||").concat((0, s.toString)(n)),
                { hashAttribute: o, hashValue: a } = this._getHashAttribute(t),
                l = a ? "".concat(o, "||").concat((0, s.toString)(a)) : null,
                u = {};
              return (
                l &&
                  this._ctx.stickyBucketAssignmentDocs[l] &&
                  Object.assign(
                    u,
                    this._ctx.stickyBucketAssignmentDocs[l].assignments || {}
                  ),
                this._ctx.stickyBucketAssignmentDocs[i] &&
                  Object.assign(
                    u,
                    this._ctx.stickyBucketAssignmentDocs[i].assignments || {}
                  ),
                u
              );
            }
            _getStickyBucketVariation(e) {
              let {
                expKey: t,
                expBucketVersion: r,
                expHashAttribute: n,
                expFallbackAttribute: i,
                expMinBucketVersion: s,
                expMeta: o,
              } = e;
              (r = r || 0), (s = s || 0), (n = n || "id"), (o = o || []);
              const a = this._getStickyBucketExperimentKey(t, r),
                l = this._getStickyBucketAssignments(n, i);
              if (s > 0)
                for (let e = 0; e <= s; e++)
                  if (void 0 !== l[this._getStickyBucketExperimentKey(t, e)])
                    return { variation: -1, versionIsBlocked: !0 };
              const u = l[a];
              if (void 0 === u) return { variation: -1 };
              const c = o.findIndex((e) => e.key === u);
              return c < 0 ? { variation: -1 } : { variation: c };
            }
            _getStickyBucketExperimentKey(e, t) {
              return (t = t || 0), "".concat(e, "__").concat(t);
            }
            _getStickyBucketAttributes(e) {
              const t = {};
              return (
                (this._ctx.stickyBucketIdentifierAttributes = this._ctx
                  .stickyBucketIdentifierAttributes
                  ? this._ctx.stickyBucketIdentifierAttributes
                  : this._deriveStickyBucketIdentifierAttributes(e)),
                this._ctx.stickyBucketIdentifierAttributes.forEach((e) => {
                  const { hashValue: r } = this._getHashAttribute(e);
                  t[e] = (0, s.toString)(r);
                }),
                t
              );
            }
            _generateStickyBucketAssignmentDoc(e, t, r) {
              const n = "".concat(e, "||").concat(t),
                i =
                  (this._ctx.stickyBucketAssignmentDocs &&
                    this._ctx.stickyBucketAssignmentDocs[n] &&
                    this._ctx.stickyBucketAssignmentDocs[n].assignments) ||
                  {},
                s = { ...i, ...r };
              return {
                key: n,
                doc: { attributeName: e, attributeValue: t, assignments: s },
                changed: JSON.stringify(i) !== JSON.stringify(s),
              };
            }
          }
          t.GrowthBook = c;
        },
        707: (e, t, r) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.clearCache = async function () {
              u.clear(), c.clear(), I(), (l = !1), await p();
            }),
            (t.configureCache = function (e) {
              Object.assign(i, e), i.backgroundSync || I();
            }),
            (t.helpers = void 0),
            (t.onHidden = g),
            (t.onVisible = f),
            (t.refreshFeatures = async function (e) {
              let {
                instance: t,
                timeout: r,
                skipCache: n,
                allowStale: a,
                backgroundSync: c,
              } = e;
              return (
                c || (i.backgroundSync = !1),
                (async function (e) {
                  let {
                    instance: t,
                    allowStale: r,
                    timeout: n,
                    skipCache: a,
                  } = e;
                  const c = v(t),
                    d = y(t),
                    g = new Date(),
                    f = new Date(g.getTime() - i.maxAge + i.staleTTL);
                  await (async function () {
                    if (!l) {
                      l = !0;
                      try {
                        if (s.localStorage) {
                          const e = await s.localStorage.getItem(i.cacheKey);
                          if (!i.disableCache && e) {
                            const t = JSON.parse(e);
                            t &&
                              Array.isArray(t) &&
                              t.forEach((e) => {
                                let [t, r] = e;
                                u.set(t, {
                                  ...r,
                                  staleAt: new Date(r.staleAt),
                                });
                              }),
                              m();
                          }
                        }
                      } catch (e) {}
                      if (!i.disableIdleStreams) {
                        const e = o.startIdleListener();
                        e && (o.stopIdleListener = e);
                      }
                    }
                  })();
                  const p = i.disableCache || a ? void 0 : u.get(d);
                  if (p && (r || p.staleAt > g) && p.staleAt > f)
                    return (
                      p.sse && h.add(c),
                      p.staleAt < g ? k(t) : _(t),
                      { data: p.data, success: !0, source: "cache" }
                    );
                  {
                    const e = await (function (e, t) {
                      return new Promise((r) => {
                        let n,
                          i = !1;
                        const s = (e) => {
                          i || ((i = !0), n && clearTimeout(n), r(e || null));
                        };
                        t && (n = setTimeout(() => s(), t)),
                          e.then((e) => s(e)).catch(() => s());
                      });
                    })(k(t), n);
                    return (
                      e || {
                        data: null,
                        success: !1,
                        source: "timeout",
                        error: new Error("Timeout"),
                      }
                    );
                  }
                })({ instance: t, allowStale: a, timeout: r, skipCache: n })
              );
            }),
            (t.setPolyfills = function (e) {
              Object.assign(s, e);
            }),
            (t.startAutoRefresh = _),
            (t.subscribe = function (e) {
              const t = v(e),
                r = a.get(t) || new Set();
              r.add(e), a.set(t, r);
            }),
            (t.unsubscribe = function (e) {
              a.forEach((t) => t.delete(e));
            });
          var n = r(106);
          const i = {
              staleTTL: 6e4,
              maxAge: 864e5,
              cacheKey: "gbFeaturesCache",
              backgroundSync: !0,
              maxEntries: 10,
              disableIdleStreams: !1,
              idleStreamInterval: 2e4,
              disableCache: !1,
            },
            s = (0, n.getPolyfills)(),
            o = {
              fetchFeaturesCall: (e) => {
                let { host: t, clientKey: r, headers: n } = e;
                return s.fetch("".concat(t, "/api/features/").concat(r), {
                  headers: n,
                });
              },
              fetchRemoteEvalCall: (e) => {
                let { host: t, clientKey: r, payload: n, headers: i } = e;
                const o = {
                  method: "POST",
                  headers: { "Content-Type": "application/json", ...i },
                  body: JSON.stringify(n),
                };
                return s.fetch("".concat(t, "/api/eval/").concat(r), o);
              },
              eventSourceCall: (e) => {
                let { host: t, clientKey: r, headers: n } = e;
                return n
                  ? new s.EventSource("".concat(t, "/sub/").concat(r), {
                      headers: n,
                    })
                  : new s.EventSource("".concat(t, "/sub/").concat(r));
              },
              startIdleListener: () => {
                let e;
                if (
                  "undefined" == typeof window ||
                  "undefined" == typeof document
                )
                  return;
                const t = () => {
                  "visible" === document.visibilityState
                    ? (window.clearTimeout(e), f())
                    : "hidden" === document.visibilityState &&
                      (e = window.setTimeout(g, i.idleStreamInterval));
                };
                return (
                  document.addEventListener("visibilitychange", t),
                  () => document.removeEventListener("visibilitychange", t)
                );
              },
              stopIdleListener: () => {},
            };
          t.helpers = o;
          try {
            globalThis.localStorage &&
              (s.localStorage = globalThis.localStorage);
          } catch (e) {}
          const a = new Map();
          let l = !1;
          const u = new Map(),
            c = new Map(),
            d = new Map(),
            h = new Set();
          function g() {
            d.forEach((e) => {
              e && ((e.state = "idle"), E(e));
            });
          }
          function f() {
            d.forEach((e) => {
              e && "idle" === e.state && w(e);
            });
          }
          async function p() {
            try {
              if (!s.localStorage) return;
              await s.localStorage.setItem(
                i.cacheKey,
                JSON.stringify(Array.from(u.entries()))
              );
            } catch (e) {}
          }
          function v(e) {
            const [t, r] = e.getApiInfo();
            return "".concat(t, "||").concat(r);
          }
          function y(e) {
            const t = v(e);
            if (!e.isRemoteEval()) return t;
            const r = e.getAttributes(),
              n = e.getCacheKeyAttributes() || Object.keys(e.getAttributes()),
              i = {};
            n.forEach((e) => {
              i[e] = r[e];
            });
            const s = e.getForcedVariations(),
              o = e.getUrl();
            return ""
              .concat(t, "||")
              .concat(JSON.stringify({ ca: i, fv: s, url: o }));
          }
          function m() {
            const e = Array.from(u.entries())
                .map((e) => {
                  let [t, r] = e;
                  return { key: t, staleAt: r.staleAt.getTime() };
                })
                .sort((e, t) => e.staleAt - t.staleAt),
              t = Math.min(Math.max(0, u.size - i.maxEntries), u.size);
            for (let r = 0; r < t; r++) u.delete(e[r].key);
          }
          function b(e, t, r) {
            const n = r.dateUpdated || "",
              s = new Date(Date.now() + i.staleTTL),
              o = i.disableCache ? void 0 : u.get(t);
            if (o && n && o.version === n) return (o.staleAt = s), void p();
            i.disableCache ||
              (u.set(t, { data: r, version: n, staleAt: s, sse: h.has(e) }),
              m()),
              p();
            const l = a.get(e);
            l &&
              l.forEach((e) =>
                (async function (e, t) {
                  await e.setPayload(t || e.getPayload());
                })(e, r)
              );
          }
          async function k(e) {
            const { apiHost: t, apiRequestHeaders: r } = e.getApiHosts(),
              n = e.getClientKey(),
              i = e.isRemoteEval(),
              s = v(e),
              a = y(e);
            let l = c.get(a);
            return (
              l ||
                ((l = (
                  i
                    ? o.fetchRemoteEvalCall({
                        host: t,
                        clientKey: n,
                        payload: {
                          attributes: e.getAttributes(),
                          forcedVariations: e.getForcedVariations(),
                          forcedFeatures: Array.from(
                            e.getForcedFeatures().entries()
                          ),
                          url: e.getUrl(),
                        },
                        headers: r,
                      })
                    : o.fetchFeaturesCall({ host: t, clientKey: n, headers: r })
                )
                  .then((e) => {
                    if (!e.ok) throw new Error("HTTP error: ".concat(e.status));
                    return (
                      "enabled" === e.headers.get("x-sse-support") && h.add(s),
                      e.json()
                    );
                  })
                  .then(
                    (t) => (
                      b(s, a, t),
                      _(e),
                      c.delete(a),
                      { data: t, success: !0, source: "network" }
                    )
                  )
                  .catch(
                    (e) => (
                      c.delete(a),
                      { data: null, source: "error", success: !1, error: e }
                    )
                  )),
                c.set(a, l)),
              l
            );
          }
          function _(e) {
            let t =
              arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
            const r = v(e),
              n = y(e),
              { streamingHost: o, streamingHostRequestHeaders: l } =
                e.getApiHosts(),
              u = e.getClientKey();
            if (
              (t && h.add(r), i.backgroundSync && h.has(r) && s.EventSource)
            ) {
              if (d.has(r)) return;
              const e = {
                src: null,
                host: o,
                clientKey: u,
                headers: l,
                cb: (t) => {
                  try {
                    if ("features-updated" === t.type) {
                      const e = a.get(r);
                      e &&
                        e.forEach((e) => {
                          k(e);
                        });
                    } else if ("features" === t.type) {
                      const e = JSON.parse(t.data);
                      b(r, n, e);
                    }
                    e.errors = 0;
                  } catch (t) {
                    S(e);
                  }
                },
                errors: 0,
                state: "active",
              };
              d.set(r, e), w(e);
            }
          }
          function S(e) {
            if (
              "idle" !== e.state &&
              (e.errors++, e.errors > 3 || (e.src && 2 === e.src.readyState))
            ) {
              const t = Math.pow(3, e.errors - 3) * (1e3 + 1e3 * Math.random());
              E(e),
                setTimeout(() => {
                  ["idle", "active"].includes(e.state) || w(e);
                }, Math.min(t, 3e5));
            }
          }
          function E(e) {
            e.src &&
              ((e.src.onopen = null),
              (e.src.onerror = null),
              e.src.close(),
              (e.src = null),
              "active" === e.state && (e.state = "disabled"));
          }
          function w(e) {
            (e.src = o.eventSourceCall({
              host: e.host,
              clientKey: e.clientKey,
              headers: e.headers,
            })),
              (e.state = "active"),
              e.src.addEventListener("features", e.cb),
              e.src.addEventListener("features-updated", e.cb),
              (e.src.onerror = () => S(e)),
              (e.src.onopen = () => {
                e.errors = 0;
              });
          }
          function A(e, t) {
            E(e), d.delete(t);
          }
          function I() {
            h.clear(), d.forEach(A), a.clear(), o.stopIdleListener();
          }
        },
        200: (e, t, r) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            Object.defineProperty(t, "BrowserCookieStickyBucketService", {
              enumerable: !0,
              get: function () {
                return s.BrowserCookieStickyBucketService;
              },
            }),
            Object.defineProperty(t, "ExpressCookieStickyBucketService", {
              enumerable: !0,
              get: function () {
                return s.ExpressCookieStickyBucketService;
              },
            }),
            Object.defineProperty(t, "GrowthBook", {
              enumerable: !0,
              get: function () {
                return i.GrowthBook;
              },
            }),
            Object.defineProperty(t, "LocalStorageStickyBucketService", {
              enumerable: !0,
              get: function () {
                return s.LocalStorageStickyBucketService;
              },
            }),
            Object.defineProperty(t, "RedisStickyBucketService", {
              enumerable: !0,
              get: function () {
                return s.RedisStickyBucketService;
              },
            }),
            Object.defineProperty(t, "StickyBucketService", {
              enumerable: !0,
              get: function () {
                return s.StickyBucketService;
              },
            }),
            Object.defineProperty(t, "clearCache", {
              enumerable: !0,
              get: function () {
                return n.clearCache;
              },
            }),
            Object.defineProperty(t, "configureCache", {
              enumerable: !0,
              get: function () {
                return n.configureCache;
              },
            }),
            Object.defineProperty(t, "evalCondition", {
              enumerable: !0,
              get: function () {
                return o.evalCondition;
              },
            }),
            Object.defineProperty(t, "getAutoExperimentChangeType", {
              enumerable: !0,
              get: function () {
                return a.getAutoExperimentChangeType;
              },
            }),
            Object.defineProperty(t, "getPolyfills", {
              enumerable: !0,
              get: function () {
                return a.getPolyfills;
              },
            }),
            Object.defineProperty(t, "helpers", {
              enumerable: !0,
              get: function () {
                return n.helpers;
              },
            }),
            Object.defineProperty(t, "isURLTargeted", {
              enumerable: !0,
              get: function () {
                return a.isURLTargeted;
              },
            }),
            Object.defineProperty(t, "onHidden", {
              enumerable: !0,
              get: function () {
                return n.onHidden;
              },
            }),
            Object.defineProperty(t, "onVisible", {
              enumerable: !0,
              get: function () {
                return n.onVisible;
              },
            }),
            Object.defineProperty(t, "paddedVersionString", {
              enumerable: !0,
              get: function () {
                return a.paddedVersionString;
              },
            }),
            Object.defineProperty(t, "prefetchPayload", {
              enumerable: !0,
              get: function () {
                return i.prefetchPayload;
              },
            }),
            Object.defineProperty(t, "setPolyfills", {
              enumerable: !0,
              get: function () {
                return n.setPolyfills;
              },
            });
          var n = r(707),
            i = r(328),
            s = r(350),
            o = r(427),
            a = r(106);
        },
        427: (e, t, r) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.evalCondition = s);
          var n = r(106);
          const i = {};
          function s(e, t, r) {
            r = r || {};
            for (const [n, i] of Object.entries(t))
              switch (n) {
                case "$or":
                  if (!d(e, i, r)) return !1;
                  break;
                case "$nor":
                  if (d(e, i, r)) return !1;
                  break;
                case "$and":
                  if (!h(e, i, r)) return !1;
                  break;
                case "$not":
                  if (s(e, i, r)) return !1;
                  break;
                default:
                  if (!a(i, o(e, n), r)) return !1;
              }
            return !0;
          }
          function o(e, t) {
            const r = t.split(".");
            let n = e;
            for (let e = 0; e < r.length; e++) {
              if (!n || "object" != typeof n || !(r[e] in n)) return null;
              n = n[r[e]];
            }
            return n;
          }
          function a(e, t, r) {
            if ("string" == typeof e) return t + "" === e;
            if ("number" == typeof e) return 1 * t === e;
            if ("boolean" == typeof e) return !!t === e;
            if (null === e) return null === t;
            if (Array.isArray(e) || !l(e))
              return JSON.stringify(t) === JSON.stringify(e);
            for (const n in e) if (!c(n, t, e[n], r)) return !1;
            return !0;
          }
          function l(e) {
            const t = Object.keys(e);
            return (
              t.length > 0 && t.filter((e) => "$" === e[0]).length === t.length
            );
          }
          function u(e, t) {
            return Array.isArray(e)
              ? e.some((e) => t.includes(e))
              : t.includes(e);
          }
          function c(e, t, r, o) {
            switch (e) {
              case "$veq":
                return (
                  (0, n.paddedVersionString)(t) ===
                  (0, n.paddedVersionString)(r)
                );
              case "$vne":
                return (
                  (0, n.paddedVersionString)(t) !==
                  (0, n.paddedVersionString)(r)
                );
              case "$vgt":
                return (
                  (0, n.paddedVersionString)(t) > (0, n.paddedVersionString)(r)
                );
              case "$vgte":
                return (
                  (0, n.paddedVersionString)(t) >= (0, n.paddedVersionString)(r)
                );
              case "$vlt":
                return (
                  (0, n.paddedVersionString)(t) < (0, n.paddedVersionString)(r)
                );
              case "$vlte":
                return (
                  (0, n.paddedVersionString)(t) <= (0, n.paddedVersionString)(r)
                );
              case "$eq":
                return t === r;
              case "$ne":
                return t !== r;
              case "$lt":
                return t < r;
              case "$lte":
                return t <= r;
              case "$gt":
                return t > r;
              case "$gte":
                return t >= r;
              case "$exists":
                return r ? null != t : null == t;
              case "$in":
                return !!Array.isArray(r) && u(t, r);
              case "$inGroup":
                return u(t, o[r] || []);
              case "$notInGroup":
                return !u(t, o[r] || []);
              case "$nin":
                return !!Array.isArray(r) && !u(t, r);
              case "$not":
                return !a(r, t, o);
              case "$size":
                return !!Array.isArray(t) && a(r, t.length, o);
              case "$elemMatch":
                return (function (e, t, r) {
                  if (!Array.isArray(e)) return !1;
                  const n = l(t) ? (e) => a(t, e, r) : (e) => s(e, t, r);
                  for (let t = 0; t < e.length; t++)
                    if (e[t] && n(e[t])) return !0;
                  return !1;
                })(t, r, o);
              case "$all":
                if (!Array.isArray(t)) return !1;
                for (let e = 0; e < r.length; e++) {
                  let n = !1;
                  for (let i = 0; i < t.length; i++)
                    if (a(r[e], t[i], o)) {
                      n = !0;
                      break;
                    }
                  if (!n) return !1;
                }
                return !0;
              case "$regex":
                try {
                  return ((c = r),
                  i[c] || (i[c] = new RegExp(c.replace(/([^\\])\//g, "$1\\/"))),
                  i[c]).test(t);
                } catch (e) {
                  return !1;
                }
              case "$type":
                return (
                  (function (e) {
                    if (null === e) return "null";
                    if (Array.isArray(e)) return "array";
                    const t = typeof e;
                    return [
                      "string",
                      "number",
                      "boolean",
                      "object",
                      "undefined",
                    ].includes(t)
                      ? t
                      : "unknown";
                  })(t) === r
                );
              default:
                return console.error("Unknown operator: " + e), !1;
            }
            var c;
          }
          function d(e, t, r) {
            if (!t.length) return !0;
            for (let n = 0; n < t.length; n++) if (s(e, t[n], r)) return !0;
            return !1;
          }
          function h(e, t, r) {
            for (let n = 0; n < t.length; n++) if (!s(e, t[n], r)) return !1;
            return !0;
          }
        },
        350: (e, t) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.StickyBucketService =
              t.RedisStickyBucketService =
              t.LocalStorageStickyBucketService =
              t.ExpressCookieStickyBucketService =
              t.BrowserCookieStickyBucketService =
                void 0);
          class r {
            async getAllAssignments(e) {
              const t = {};
              return (
                (
                  await Promise.all(
                    Object.entries(e).map((e) => {
                      let [t, r] = e;
                      return this.getAssignments(t, r);
                    })
                  )
                ).forEach((e) => {
                  if (e) {
                    const r = ""
                      .concat(e.attributeName, "||")
                      .concat(e.attributeValue);
                    t[r] = e;
                  }
                }),
                t
              );
            }
          }
          (t.StickyBucketService = r),
            (t.LocalStorageStickyBucketService = class extends r {
              constructor(e) {
                (e = e || {}),
                  super(),
                  (this.prefix = e.prefix || "gbStickyBuckets__");
                try {
                  this.localStorage = e.localStorage || globalThis.localStorage;
                } catch (e) {}
              }
              async getAssignments(e, t) {
                const r = "".concat(e, "||").concat(t);
                let n = null;
                if (!this.localStorage) return n;
                try {
                  const e =
                      (await this.localStorage.getItem(this.prefix + r)) ||
                      "{}",
                    t = JSON.parse(e);
                  t.attributeName &&
                    t.attributeValue &&
                    t.assignments &&
                    (n = t);
                } catch (e) {}
                return n;
              }
              async saveAssignments(e) {
                const t = ""
                  .concat(e.attributeName, "||")
                  .concat(e.attributeValue);
                if (this.localStorage)
                  try {
                    await this.localStorage.setItem(
                      this.prefix + t,
                      JSON.stringify(e)
                    );
                  } catch (e) {}
              }
            }),
            (t.ExpressCookieStickyBucketService = class extends r {
              constructor(e) {
                let {
                  prefix: t = "gbStickyBuckets__",
                  req: r,
                  res: n,
                  cookieAttributes: i = {},
                } = e;
                super(),
                  (this.prefix = t),
                  (this.req = r),
                  (this.res = n),
                  (this.cookieAttributes = i);
              }
              async getAssignments(e, t) {
                const r = "".concat(e, "||").concat(t);
                let n = null;
                if (!this.req) return n;
                try {
                  const e = this.req.cookies[this.prefix + r] || "{}",
                    t = JSON.parse(e);
                  t.attributeName &&
                    t.attributeValue &&
                    t.assignments &&
                    (n = t);
                } catch (e) {}
                return n;
              }
              async saveAssignments(e) {
                const t = ""
                  .concat(e.attributeName, "||")
                  .concat(e.attributeValue);
                if (!this.res) return;
                const r = JSON.stringify(e);
                this.res.cookie(
                  encodeURIComponent(this.prefix + t),
                  encodeURIComponent(r),
                  this.cookieAttributes
                );
              }
            }),
            (t.BrowserCookieStickyBucketService = class extends r {
              constructor(e) {
                let {
                  prefix: t = "gbStickyBuckets__",
                  jsCookie: r,
                  cookieAttributes: n = {},
                } = e;
                super(),
                  (this.prefix = t),
                  (this.jsCookie = r),
                  (this.cookieAttributes = n);
              }
              async getAssignments(e, t) {
                const r = "".concat(e, "||").concat(t);
                let n = null;
                if (!this.jsCookie) return n;
                try {
                  const e = this.jsCookie.get(this.prefix + r),
                    t = JSON.parse(e || "{}");
                  t.attributeName &&
                    t.attributeValue &&
                    t.assignments &&
                    (n = t);
                } catch (e) {}
                return n;
              }
              async saveAssignments(e) {
                const t = ""
                  .concat(e.attributeName, "||")
                  .concat(e.attributeValue);
                if (!this.jsCookie) return;
                const r = JSON.stringify(e);
                this.jsCookie.set(this.prefix + t, r, this.cookieAttributes);
              }
            }),
            (t.RedisStickyBucketService = class extends r {
              constructor(e) {
                let { redis: t } = e;
                super(), (this.redis = t);
              }
              async getAllAssignments(e) {
                const t = {},
                  r = Object.entries(e).map((e) => {
                    let [t, r] = e;
                    return "".concat(t, "||").concat(r);
                  });
                return this.redis
                  ? (await this.redis.mget(...r).then((e) => {
                      e.forEach((e) => {
                        try {
                          const r = JSON.parse(e || "{}");
                          if (
                            r.attributeName &&
                            r.attributeValue &&
                            r.assignments
                          ) {
                            const e = ""
                              .concat(r.attributeName, "||")
                              .concat(r.attributeValue);
                            t[e] = r;
                          }
                        } catch (e) {}
                      });
                    }),
                    t)
                  : t;
              }
              async getAssignments(e, t) {
                return null;
              }
              async saveAssignments(e) {
                const t = ""
                  .concat(e.attributeName, "||")
                  .concat(e.attributeValue);
                this.redis && (await this.redis.set(t, JSON.stringify(e)));
              }
            });
        },
        106: (e, t) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.chooseVariation = function (e, t) {
              for (let r = 0; r < t.length; r++) if (o(e, t[r])) return r;
              return -1;
            }),
            (t.decrypt = async function (e, t, n) {
              if (
                ((t = t || ""),
                !(n =
                  n ||
                  (globalThis.crypto && globalThis.crypto.subtle) ||
                  r.SubtleCrypto))
              )
                throw new Error("No SubtleCrypto implementation found");
              try {
                const r = await n.importKey(
                    "raw",
                    u(t),
                    { name: "AES-CBC", length: 128 },
                    !0,
                    ["encrypt", "decrypt"]
                  ),
                  [i, s] = e.split("."),
                  o = await n.decrypt({ name: "AES-CBC", iv: u(i) }, r, u(s));
                return new TextDecoder().decode(o);
              } catch (e) {
                throw new Error("Failed to decrypt");
              }
            }),
            (t.getAutoExperimentChangeType = function (e) {
              return e.urlPatterns &&
                e.variations.some((e) => c(e) && "urlRedirect" in e)
                ? "redirect"
                : e.variations.some(
                    (e) => c(e) && (e.domMutations || "js" in e || "css" in e)
                  )
                ? "visual"
                : "unknown";
            }),
            (t.getBucketRanges = function (e, t, r) {
              (t = void 0 === t ? 1 : t) < 0 ? (t = 0) : t > 1 && (t = 1);
              const n = s(e);
              (r = r || n).length !== e && (r = n);
              const i = r.reduce((e, t) => t + e, 0);
              (i < 0.99 || i > 1.01) && (r = n);
              let o = 0;
              return r.map((e) => {
                const r = o;
                return (o += e), [r, r + t * e];
              });
            }),
            (t.getEqualWeights = s),
            (t.getPolyfills = function () {
              return r;
            }),
            (t.getQueryStringOverride = function (e, t, r) {
              if (!t) return null;
              const n = t.split("?")[1];
              if (!n) return null;
              const i = n
                .replace(/#.*/, "")
                .split("&")
                .map((e) => e.split("=", 2))
                .filter((t) => {
                  let [r] = t;
                  return r === e;
                })
                .map((e) => {
                  let [, t] = e;
                  return parseInt(t);
                });
              return i.length > 0 && i[0] >= 0 && i[0] < r ? i[0] : null;
            }),
            (t.getUrlRegExp = a),
            (t.hash = i),
            (t.inNamespace = function (e, t) {
              const r = i("__" + t[0], e, 1);
              return null !== r && r >= t[1] && r < t[2];
            }),
            (t.inRange = o),
            (t.isIncluded = function (e) {
              try {
                return e();
              } catch (e) {
                return console.error(e), !1;
              }
            }),
            (t.isURLTargeted = function (e, t) {
              if (!t.length) return !1;
              let r = !1,
                n = !1;
              for (let i = 0; i < t.length; i++) {
                const s = l(e, t[i].type, t[i].pattern);
                if (!1 === t[i].include) {
                  if (s) return !1;
                } else (r = !0), s && (n = !0);
              }
              return n || !r;
            }),
            (t.loadSDKVersion = function () {
              let e;
              try {
                e = "1.1.0";
              } catch (t) {
                e = "";
              }
              return e;
            }),
            (t.mergeQueryStrings = function (e, t) {
              let r, n;
              try {
                (r = new URL(e)), (n = new URL(t));
              } catch (e) {
                return (
                  console.error("Unable to merge query strings: ".concat(e)), t
                );
              }
              return (
                r.searchParams.forEach((e, t) => {
                  n.searchParams.has(t) || n.searchParams.set(t, e);
                }),
                n.toString()
              );
            }),
            (t.paddedVersionString = function (e) {
              "number" == typeof e && (e += ""),
                (e && "string" == typeof e) || (e = "0");
              const t = e.replace(/(^v|\+.*$)/g, "").split(/[-.]/);
              return (
                3 === t.length && t.push("~"),
                t
                  .map((e) => (e.match(/^[0-9]+$/) ? e.padStart(5, " ") : e))
                  .join("-")
              );
            }),
            (t.toString = function (e) {
              return "string" == typeof e ? e : JSON.stringify(e);
            });
          const r = {
            fetch: globalThis.fetch
              ? globalThis.fetch.bind(globalThis)
              : void 0,
            SubtleCrypto: globalThis.crypto ? globalThis.crypto.subtle : void 0,
            EventSource: globalThis.EventSource,
          };
          function n(e) {
            let t = 2166136261;
            const r = e.length;
            for (let n = 0; n < r; n++)
              (t ^= e.charCodeAt(n)),
                (t += (t << 1) + (t << 4) + (t << 7) + (t << 8) + (t << 24));
            return t >>> 0;
          }
          function i(e, t, r) {
            return 2 === r
              ? (n(n(e + t) + "") % 1e4) / 1e4
              : 1 === r
              ? (n(t + e) % 1e3) / 1e3
              : null;
          }
          function s(e) {
            return e <= 0 ? [] : new Array(e).fill(1 / e);
          }
          function o(e, t) {
            return e >= t[0] && e < t[1];
          }
          function a(e) {
            try {
              const t = e.replace(/([^\\])\//g, "$1\\/");
              return new RegExp(t);
            } catch (e) {
              return void console.error(e);
            }
          }
          function l(e, t, r) {
            try {
              const n = new URL(e, "https://_");
              if ("regex" === t) {
                const e = a(r);
                return (
                  !!e &&
                  (e.test(n.href) || e.test(n.href.substring(n.origin.length)))
                );
              }
              return (
                "simple" === t &&
                (function (e, t) {
                  try {
                    const r = new URL(
                        t
                          .replace(/^([^:/?]*)\./i, "https://$1.")
                          .replace(/\*/g, "_____"),
                        "https://_____"
                      ),
                      n = [
                        [e.host, r.host, !1],
                        [e.pathname, r.pathname, !0],
                      ];
                    return (
                      r.hash && n.push([e.hash, r.hash, !1]),
                      r.searchParams.forEach((t, r) => {
                        n.push([e.searchParams.get(r) || "", t, !1]);
                      }),
                      !n.some(
                        (e) =>
                          !(function (e, t, r) {
                            try {
                              let n = t
                                .replace(/[*.+?^${}()|[\]\\]/g, "\\$&")
                                .replace(/_____/g, ".*");
                              return (
                                r &&
                                  (n =
                                    "\\/?" +
                                    n.replace(/(^\/|\/$)/g, "") +
                                    "\\/?"),
                                new RegExp("^" + n + "$", "i").test(e)
                              );
                            } catch (e) {
                              return !1;
                            }
                          })(e[0], e[1], e[2])
                      )
                    );
                  } catch (e) {
                    return !1;
                  }
                })(n, r)
              );
            } catch (e) {
              return !1;
            }
          }
          const u = (e) => Uint8Array.from(atob(e), (e) => e.charCodeAt(0));
          function c(e) {
            return "object" == typeof e && null !== e;
          }
        },
        182: (e, t, r) => {
          "use strict";
          function n(e) {
            return (
              null != e &&
              "object" == typeof e &&
              !0 === e["@@functional/placeholder"]
            );
          }
          function i(e) {
            return function t(r) {
              return 0 === arguments.length || n(r)
                ? t
                : e.apply(this, arguments);
            };
          }
          function s(e) {
            return function t(r, s) {
              switch (arguments.length) {
                case 0:
                  return t;
                case 1:
                  return n(r)
                    ? t
                    : i(function (t) {
                        return e(r, t);
                      });
                default:
                  return n(r) && n(s)
                    ? t
                    : n(r)
                    ? i(function (t) {
                        return e(t, s);
                      })
                    : n(s)
                    ? i(function (t) {
                        return e(r, t);
                      })
                    : e(r, s);
              }
            };
          }
          function o(e) {
            return function t(r, o, a) {
              switch (arguments.length) {
                case 0:
                  return t;
                case 1:
                  return n(r)
                    ? t
                    : s(function (t, n) {
                        return e(r, t, n);
                      });
                case 2:
                  return n(r) && n(o)
                    ? t
                    : n(r)
                    ? s(function (t, r) {
                        return e(t, o, r);
                      })
                    : n(o)
                    ? s(function (t, n) {
                        return e(r, t, n);
                      })
                    : i(function (t) {
                        return e(r, o, t);
                      });
                default:
                  return n(r) && n(o) && n(a)
                    ? t
                    : n(r) && n(o)
                    ? s(function (t, r) {
                        return e(t, r, a);
                      })
                    : n(r) && n(a)
                    ? s(function (t, r) {
                        return e(t, o, r);
                      })
                    : n(o) && n(a)
                    ? s(function (t, n) {
                        return e(r, t, n);
                      })
                    : n(r)
                    ? i(function (t) {
                        return e(t, o, a);
                      })
                    : n(o)
                    ? i(function (t) {
                        return e(r, t, a);
                      })
                    : n(a)
                    ? i(function (t) {
                        return e(r, o, t);
                      })
                    : e(r, o, a);
              }
            };
          }
          function a(e, t) {
            return Object.prototype.hasOwnProperty.call(t, e);
          }
          Object.defineProperty(t, Symbol.toStringTag, { value: "Module" });
          var l = i(function (e) {
            return null === e
              ? "Null"
              : void 0 === e
              ? "Undefined"
              : Object.prototype.toString.call(e).slice(8, -1);
          });
          function u(e) {
            return "[object Object]" === Object.prototype.toString.call(e);
          }
          const c =
            Number.isInteger ||
            function (e) {
              return (0 | e) === e;
            };
          function d(e, t, r) {
            if (
              (r || (r = new h()),
              (function (e) {
                var t = typeof e;
                return null == e || ("object" != t && "function" != t);
              })(e))
            )
              return e;
            var n,
              i = function (t) {
                var n = r.get(e);
                if (n) return n;
                for (var i in (r.set(e, t), e))
                  Object.prototype.hasOwnProperty.call(e, i) &&
                    (t[i] = d(e[i], 0, r));
                return t;
              };
            switch (l(e)) {
              case "Object":
                return i(Object.create(Object.getPrototypeOf(e)));
              case "Array":
                return i(Array(e.length));
              case "Date":
                return new Date(e.valueOf());
              case "RegExp":
                return (
                  (n = e),
                  new RegExp(
                    n.source,
                    n.flags
                      ? n.flags
                      : (n.global ? "g" : "") +
                        (n.ignoreCase ? "i" : "") +
                        (n.multiline ? "m" : "") +
                        (n.sticky ? "y" : "") +
                        (n.unicode ? "u" : "") +
                        (n.dotAll ? "s" : "")
                  )
                );
              case "Int8Array":
              case "Uint8Array":
              case "Uint8ClampedArray":
              case "Int16Array":
              case "Uint16Array":
              case "Int32Array":
              case "Uint32Array":
              case "Float32Array":
              case "Float64Array":
              case "BigInt64Array":
              case "BigUint64Array":
                return e.slice();
              default:
                return e;
            }
          }
          var h = (function () {
              function e() {
                (this.map = {}), (this.length = 0);
              }
              return (
                (e.prototype.set = function (e, t) {
                  var r = this.hash(e),
                    n = this.map[r];
                  n || (this.map[r] = n = []),
                    n.push([e, t]),
                    (this.length += 1);
                }),
                (e.prototype.hash = function (e) {
                  var t = [];
                  for (var r in e) t.push(Object.prototype.toString.call(e[r]));
                  return t.join();
                }),
                (e.prototype.get = function (e) {
                  if (this.length <= 180) {
                    for (var t in this.map)
                      for (var r = this.map[t], n = 0; n < r.length; n += 1)
                        if ((s = r[n])[0] === e) return s[1];
                  } else {
                    var i = this.hash(e);
                    if ((r = this.map[i]))
                      for (n = 0; n < r.length; n += 1) {
                        var s;
                        if ((s = r[n])[0] === e) return s[1];
                      }
                  }
                }),
                e
              );
            })(),
            g = i(function (e) {
              return null != e && "function" == typeof e.clone
                ? e.clone()
                : d(e);
            });
          function f(e, t) {
            for (var r = t, n = 0; n < e.length; n += 1) {
              if (null == r) return;
              var i = e[n];
              r = c(i)
                ? ((o = r),
                  (a = void 0),
                  (l = void 0),
                  (l = (s = i) < 0 ? o.length + s : s),
                  (a = o),
                  "[object String]" === Object.prototype.toString.call(a)
                    ? o.charAt(l)
                    : o[l])
                : r[i];
            }
            var s, o, a, l;
            return r;
          }
          var p = o(function (e, t, r) {
              var n,
                i = {};
              for (n in ((r = r || {}), (t = t || {})))
                a(n, t) && (i[n] = a(n, r) ? e(n, t[n], r[n]) : t[n]);
              for (n in r) a(n, r) && !a(n, i) && (i[n] = r[n]);
              return i;
            }),
            v = o(function e(t, r, n) {
              return p(
                function (r, n, i) {
                  return u(n) && u(i) ? e(t, n, i) : t(r, n, i);
                },
                r,
                n
              );
            }),
            y = o(function (e, t, r) {
              return v(
                function (t, r, n) {
                  return e(r, n);
                },
                t,
                r
              );
            }),
            m = s(f),
            b = s(function (e, t) {
              var r = {};
              for (var n in t) e(t[n], n, t) && (r[n] = t[n]);
              return r;
            });
          const k = (e) =>
              "function" == typeof e &&
              Boolean(e.constructor && e.call && e.apply),
            _ = (e) => "string" == typeof e,
            S = (e) => null === e,
            E = (e) => void 0 === e,
            w = (e) => S(e) || E(e),
            A = (e) => !E(e),
            I = (e) => !w(e),
            x = (e) => e instanceof Error,
            T = (e, t) => {
              const r = t.split(".");
              return m(r, e);
            },
            P = (e) => !S(e) && "object" == typeof e && !Array.isArray(e),
            C = (e) =>
              !S(e) && "[object Object]" === Object.prototype.toString.call(e),
            O = (e, t) => {
              if (!Array.isArray(e) || !Array.isArray(t)) return g(t);
              const r = g(e);
              return (
                t.forEach((e, t) => {
                  r[t] = Array.isArray(e) || P(e) ? R(r[t], e) : e;
                }),
                r
              );
            },
            R = (e, t) => y(O, e, t),
            B = (e) => C(e) && Object.keys(e).length > 0,
            M = (e) => {
              const t = b(A, e);
              return (
                Object.keys(t).forEach((e) => {
                  const r = t[e];
                  C(r) && (t[e] = M(r));
                }),
                t
              );
            },
            $ = (e) => {
              const t = b(I, e);
              return (
                Object.keys(t).forEach((e) => {
                  const r = t[e];
                  C(r) && (t[e] = $(r));
                }),
                t
              );
            },
            D = (e) => {
              let t = e;
              if (!_(e) && !w(e))
                try {
                  t = JSON.stringify(e);
                } catch (e) {
                  t = null;
                }
              return t;
            },
            j = (e, t, r, n, i) => {
              const s = { category: e, name: t, properties: r, options: n };
              return (
                k(i) && (s.callback = i),
                k(n) &&
                  ((s.category = e),
                  (s.name = t),
                  (s.properties = r),
                  delete s.options,
                  (s.callback = n)),
                k(r) &&
                  ((s.category = e),
                  (s.name = t),
                  delete s.properties,
                  delete s.options,
                  (s.callback = r)),
                k(t) &&
                  ((s.category = e),
                  delete s.name,
                  delete s.properties,
                  delete s.options,
                  (s.callback = t)),
                k(e) &&
                  (delete s.category,
                  delete s.name,
                  delete s.properties,
                  delete s.options,
                  (s.callback = e)),
                C(e)
                  ? (delete s.name,
                    delete s.category,
                    (s.properties = e),
                    (s.options = t))
                  : C(t) &&
                    (delete s.name,
                    (s.properties = t),
                    (s.options = k(r) ? null : r)),
                _(e) && !_(t) && (delete s.category, (s.name = e)),
                A(s.category) || delete s.category,
                A(s.name) || delete s.name,
                (s.properties = s.properties ? g(s.properties) : {}),
                A(s.options) ? (s.options = g(s.options)) : delete s.options,
                (s.properties = R(C(s.properties) ? s.properties : {}, {
                  name: _(s.name) ? s.name : null,
                  category: _(s.category) ? s.category : null,
                })),
                s
              );
            },
            L = (e, t, r, n) => {
              const i = { name: e, properties: t, options: r };
              return (
                k(n) && (i.callback = n),
                k(r) &&
                  ((i.properties = t), delete i.options, (i.callback = r)),
                k(t) &&
                  (delete i.properties, delete i.options, (i.callback = t)),
                (i.properties = I(i.properties) ? g(i.properties) : {}),
                A(i.options) ? (i.options = g(i.options)) : delete i.options,
                i
              );
            },
            U = (e, t, r, n) => {
              const i = { userId: e, traits: t, options: r };
              return (
                k(n) && (i.callback = n),
                k(r) &&
                  ((i.userId = e),
                  (i.traits = t),
                  delete i.options,
                  (i.callback = r)),
                k(t) &&
                  ((i.userId = e),
                  delete i.traits,
                  delete i.options,
                  (i.callback = t)),
                (C(e) || S(e)) &&
                  ((i.userId = null), (i.traits = e), (i.options = t)),
                A(i.userId) ? (i.userId = D(i.userId)) : delete i.userId,
                C(i.traits) ? (i.traits = g(i.traits)) : delete i.traits,
                A(i.options) ? (i.options = g(i.options)) : delete i.options,
                i
              );
            },
            N = (e, t, r, n) => {
              const i = { to: e, from: t, options: r };
              return (
                k(n) && (i.callback = n),
                k(r) &&
                  ((i.to = e),
                  (i.from = t),
                  delete i.options,
                  (i.callback = r)),
                k(t)
                  ? ((i.to = e),
                    delete i.from,
                    delete i.options,
                    (i.callback = t))
                  : (C(t) || S(t)) &&
                    ((i.to = e), delete i.from, (i.options = t)),
                k(e)
                  ? (delete i.to,
                    delete i.from,
                    delete i.options,
                    (i.callback = e))
                  : (C(e) || S(e)) &&
                    (delete i.to, delete i.from, (i.options = e)),
                A(i.to) ? (i.to = D(i.to)) : delete i.to,
                A(i.from) ? (i.from = D(i.from)) : delete i.from,
                A(i.options) ? (i.options = g(i.options)) : delete i.options,
                i
              );
            },
            F = (e, t, r, n) => {
              const i = { groupId: e, traits: t, options: r };
              return (
                k(n) && (i.callback = n),
                k(r) &&
                  ((i.groupId = e),
                  (i.traits = t),
                  delete i.options,
                  (i.callback = r)),
                k(t) &&
                  ((i.groupId = e),
                  delete i.traits,
                  delete i.options,
                  (i.callback = t)),
                k(e)
                  ? ((i.groupId = null),
                    delete i.traits,
                    delete i.options,
                    (i.callback = e))
                  : (C(e) || S(e)) &&
                    ((i.groupId = null),
                    (i.traits = e),
                    (i.options = k(t) ? null : t)),
                A(i.groupId) ? (i.groupId = D(i.groupId)) : delete i.groupId,
                (i.traits = C(i.traits) ? g(i.traits) : {}),
                A(i.options) ? (i.options = g(i.options)) : delete i.options,
                i
              );
            },
            V = "CapabilitiesManager",
            H = "ConfigManager",
            K = "EventManager",
            G = "PluginsManager",
            Q = "UserSessionManager",
            z = "ErrorHandler",
            q = "PluginEngine",
            J = "StoreManager",
            W = "RudderStackApplication",
            X = "AnalyticsCore",
            Z = "RudderLabs JavaScript SDK",
            Y = "3.5.1",
            ee = "RudderJS-Initiated",
            te = "preloadedEventsBuffer",
            re = "ajs_aid",
            ne = "ajs_uid",
            ie = "ajs_event",
            se = 18e5,
            oe = (e = "app") => {
              globalThis.RudderStackGlobals ||
                (globalThis.RudderStackGlobals = {}),
                globalThis.RudderStackGlobals[e] ||
                  (globalThis.RudderStackGlobals[e] = {});
            },
            ae = (e, t, r = "app") => {
              oe(r), (globalThis.RudderStackGlobals[r][e] = t);
            },
            le = (e, t) => {
              const r = {};
              return (
                e.forEach((n, i) => {
                  if (i.startsWith(t)) {
                    const n = i.substring(t.length);
                    r[n] = e.get(i);
                  }
                }),
                r
              );
            },
            ue = (e, t) => {
              const r = e.shift();
              let n;
              if (k(t[r])) {
                switch (r) {
                  case "page":
                    n = j(...e);
                    break;
                  case "track":
                    n = L(...e);
                    break;
                  case "identify":
                    n = U(...e);
                    break;
                  case "alias":
                    n = N(...e);
                    break;
                  case "group":
                    n = F(...e);
                    break;
                  default:
                    t[r](...e);
                }
                n && t[r](n);
              }
            },
            ce = ":: ",
            de = (e, t) =>
              `Failed to load the script with the id "${e}" from URL "${t}".`,
            he = (e, t, r) => {
              const n = [];
              return function (i, s) {
                if (!(t?.includes(i) || (e && w(s)))) {
                  if ("object" != typeof s || S(s)) return s;
                  for (; n.length > 0 && n[n.length - 1] !== this; ) n.pop();
                  return n.includes(s)
                    ? (r?.warn(
                        ((e, t) =>
                          `JSONStringify${ce}A circular reference has been detected in the object and the property "${t}" has been dropped from the output.`)(
                          0,
                          i
                        )
                      ),
                      "[Circular Reference]")
                    : (n.push(s), s);
                }
              };
            },
            ge = (e, t, r, n) => {
              try {
                return JSON.stringify(e, he(t, r, n));
              } catch (e) {
                return (
                  n?.warn("Failed to convert the value to a JSON string.", e),
                  null
                );
              }
            },
            fe = (e, t) => {
              let r = e;
              return (
                x(e)
                  ? (r.message = `${t}: ${e.message}`)
                  : (r = new Error(`${t}: ${ge(e)}`)),
                r
              );
            };
          class pe {
            hasErrorHandler = !1;
            constructor(e, t, r = 1e4) {
              (this.errorHandler = e),
                (this.logger = t),
                (this.timeout = r),
                (this.hasErrorHandler = Boolean(this.errorHandler)),
                (this.onError = this.onError.bind(this));
            }
            loadJSFile(e) {
              const {
                  url: t,
                  id: r,
                  timeout: n,
                  async: i,
                  callback: s,
                  extraAttributes: o,
                } = e,
                a = !k(s);
              ((e, t, r, n = !0, i) =>
                new Promise((s, o) => {
                  document.getElementById(t) &&
                    o(
                      new Error(
                        ((e) =>
                          `A script with the id "${e}" is already loaded. Skipping the loading of this script to prevent conflicts.`)(
                          t
                        )
                      )
                    );
                  try {
                    let a;
                    ((e) => {
                      const t = document.getElementsByTagName("head");
                      if (t.length > 0)
                        return void t[0]?.insertBefore(e, t[0]?.firstChild);
                      const r = document.getElementsByTagName("script");
                      if (r.length > 0 && r[0]?.parentNode)
                        return void r[0]?.parentNode.insertBefore(e, r[0]);
                      const n = document.createElement("head");
                      n.appendChild(e);
                      const i = document.getElementsByTagName("html")[0];
                      i?.insertBefore(n, i.firstChild);
                    })(
                      ((e, t, r = !0, n = null, i = null, s = {}) => {
                        const o = document.createElement("script");
                        return (
                          (o.type = "text/javascript"),
                          (o.onload = n),
                          (o.onerror = i),
                          (o.src = e),
                          (o.id = t),
                          (o.async = r),
                          Object.keys(s).forEach((e) => {
                            o.setAttribute(e, s[e]);
                          }),
                          o.setAttribute("data-loader", "RS_JS_SDK"),
                          o
                        );
                      })(
                        e,
                        t,
                        n,
                        () => {
                          globalThis.clearTimeout(a), s(t);
                        },
                        () => {
                          globalThis.clearTimeout(a), o(new Error(de(t, e)));
                        },
                        i
                      )
                    ),
                      (a = globalThis.setTimeout(() => {
                        o(
                          new Error(
                            ((e, t, r) =>
                              `A timeout of ${r} ms occurred while trying to load the script with id "${e}" from URL "${t}".`)(
                              t,
                              e,
                              r
                            )
                          )
                        );
                      }, r));
                  } catch (r) {
                    o(fe(r, de(t, e)));
                  }
                }))(t, r, n || this.timeout, i, o)
                .then((e) => {
                  a || s(e);
                })
                .catch((e) => {
                  this.onError(e), a || s();
                });
            }
            onError(e) {
              if (!this.hasErrorHandler) throw e;
              this.errorHandler?.onError(e, "ExternalSrcLoader");
            }
          }
          var ve = Symbol.for("preact-signals");
          function ye() {
            if (_e > 1) _e--;
            else {
              for (var e, t = !1; void 0 !== ke; ) {
                var r = ke;
                for (ke = void 0, Se++; void 0 !== r; ) {
                  var n = r.o;
                  if (((r.o = void 0), (r.f &= -3), !(8 & r.f) && xe(r)))
                    try {
                      r.c();
                    } catch (r) {
                      t || ((e = r), (t = !0));
                    }
                  r = n;
                }
              }
              if (((Se = 0), _e--, t)) throw e;
            }
          }
          function me(e) {
            if (_e > 0) return e();
            _e++;
            try {
              return e();
            } finally {
              ye();
            }
          }
          var be = void 0,
            ke = void 0,
            _e = 0,
            Se = 0,
            Ee = 0;
          function we(e) {
            if (void 0 !== be) {
              var t = e.n;
              if (void 0 === t || t.t !== be)
                return (
                  (t = {
                    i: 0,
                    S: e,
                    p: be.s,
                    n: void 0,
                    t: be,
                    e: void 0,
                    x: void 0,
                    r: t,
                  }),
                  void 0 !== be.s && (be.s.n = t),
                  (be.s = t),
                  (e.n = t),
                  32 & be.f && e.S(t),
                  t
                );
              if (-1 === t.i)
                return (
                  (t.i = 0),
                  void 0 !== t.n &&
                    ((t.n.p = t.p),
                    void 0 !== t.p && (t.p.n = t.n),
                    (t.p = be.s),
                    (t.n = void 0),
                    (be.s.n = t),
                    (be.s = t)),
                  t
                );
            }
          }
          function Ae(e) {
            (this.v = e), (this.i = 0), (this.n = void 0), (this.t = void 0);
          }
          function Ie(e) {
            return new Ae(e);
          }
          function xe(e) {
            for (var t = e.s; void 0 !== t; t = t.n)
              if (t.S.i !== t.i || !t.S.h() || t.S.i !== t.i) return !0;
            return !1;
          }
          function Te(e) {
            for (var t = e.s; void 0 !== t; t = t.n) {
              var r = t.S.n;
              if (
                (void 0 !== r && (t.r = r),
                (t.S.n = t),
                (t.i = -1),
                void 0 === t.n)
              ) {
                e.s = t;
                break;
              }
            }
          }
          function Pe(e) {
            for (var t = e.s, r = void 0; void 0 !== t; ) {
              var n = t.p;
              -1 === t.i
                ? (t.S.U(t),
                  void 0 !== n && (n.n = t.n),
                  void 0 !== t.n && (t.n.p = n))
                : (r = t),
                (t.S.n = t.r),
                void 0 !== t.r && (t.r = void 0),
                (t = n);
            }
            e.s = r;
          }
          function Ce(e) {
            Ae.call(this, void 0),
              (this.x = e),
              (this.s = void 0),
              (this.g = Ee - 1),
              (this.f = 4);
          }
          function Oe(e) {
            var t = e.u;
            if (((e.u = void 0), "function" == typeof t)) {
              _e++;
              var r = be;
              be = void 0;
              try {
                t();
              } catch (t) {
                throw ((e.f &= -2), (e.f |= 8), Re(e), t);
              } finally {
                (be = r), ye();
              }
            }
          }
          function Re(e) {
            for (var t = e.s; void 0 !== t; t = t.n) t.S.U(t);
            (e.x = void 0), (e.s = void 0), Oe(e);
          }
          function Be(e) {
            if (be !== this) throw new Error("Out-of-order effect");
            Pe(this), (be = e), (this.f &= -2), 8 & this.f && Re(this), ye();
          }
          function Me(e) {
            (this.x = e),
              (this.u = void 0),
              (this.s = void 0),
              (this.o = void 0),
              (this.f = 32);
          }
          function $e(e) {
            var t = new Me(e);
            try {
              t.c();
            } catch (e) {
              throw (t.d(), e);
            }
            return t.d.bind(t);
          }
          (Ae.prototype.brand = ve),
            (Ae.prototype.h = function () {
              return !0;
            }),
            (Ae.prototype.S = function (e) {
              this.t !== e &&
                void 0 === e.e &&
                ((e.x = this.t),
                void 0 !== this.t && (this.t.e = e),
                (this.t = e));
            }),
            (Ae.prototype.U = function (e) {
              if (void 0 !== this.t) {
                var t = e.e,
                  r = e.x;
                void 0 !== t && ((t.x = r), (e.e = void 0)),
                  void 0 !== r && ((r.e = t), (e.x = void 0)),
                  e === this.t && (this.t = r);
              }
            }),
            (Ae.prototype.subscribe = function (e) {
              var t = this;
              return $e(function () {
                var r = t.value,
                  n = be;
                be = void 0;
                try {
                  e(r);
                } finally {
                  be = n;
                }
              });
            }),
            (Ae.prototype.valueOf = function () {
              return this.value;
            }),
            (Ae.prototype.toString = function () {
              return this.value + "";
            }),
            (Ae.prototype.toJSON = function () {
              return this.value;
            }),
            (Ae.prototype.peek = function () {
              var e = be;
              be = void 0;
              try {
                return this.value;
              } finally {
                be = e;
              }
            }),
            Object.defineProperty(Ae.prototype, "value", {
              get: function () {
                var e = we(this);
                return void 0 !== e && (e.i = this.i), this.v;
              },
              set: function (e) {
                if (e !== this.v) {
                  if (Se > 100) throw new Error("Cycle detected");
                  (this.v = e), this.i++, Ee++, _e++;
                  try {
                    for (var t = this.t; void 0 !== t; t = t.x) t.t.N();
                  } finally {
                    ye();
                  }
                }
              },
            }),
            ((Ce.prototype = new Ae()).h = function () {
              if (((this.f &= -3), 1 & this.f)) return !1;
              if (32 == (36 & this.f)) return !0;
              if (((this.f &= -5), this.g === Ee)) return !0;
              if (((this.g = Ee), (this.f |= 1), this.i > 0 && !xe(this)))
                return (this.f &= -2), !0;
              var e = be;
              try {
                Te(this), (be = this);
                var t = this.x();
                (16 & this.f || this.v !== t || 0 === this.i) &&
                  ((this.v = t), (this.f &= -17), this.i++);
              } catch (e) {
                (this.v = e), (this.f |= 16), this.i++;
              }
              return (be = e), Pe(this), (this.f &= -2), !0;
            }),
            (Ce.prototype.S = function (e) {
              if (void 0 === this.t) {
                this.f |= 36;
                for (var t = this.s; void 0 !== t; t = t.n) t.S.S(t);
              }
              Ae.prototype.S.call(this, e);
            }),
            (Ce.prototype.U = function (e) {
              if (
                void 0 !== this.t &&
                (Ae.prototype.U.call(this, e), void 0 === this.t)
              ) {
                this.f &= -33;
                for (var t = this.s; void 0 !== t; t = t.n) t.S.U(t);
              }
            }),
            (Ce.prototype.N = function () {
              if (!(2 & this.f)) {
                this.f |= 6;
                for (var e = this.t; void 0 !== e; e = e.x) e.t.N();
              }
            }),
            Object.defineProperty(Ce.prototype, "value", {
              get: function () {
                if (1 & this.f) throw new Error("Cycle detected");
                var e = we(this);
                if ((this.h(), void 0 !== e && (e.i = this.i), 16 & this.f))
                  throw this.v;
                return this.v;
              },
            }),
            (Me.prototype.c = function () {
              var e = this.S();
              try {
                if (8 & this.f) return;
                if (void 0 === this.x) return;
                var t = this.x();
                "function" == typeof t && (this.u = t);
              } finally {
                e();
              }
            }),
            (Me.prototype.S = function () {
              if (1 & this.f) throw new Error("Cycle detected");
              (this.f |= 1), (this.f &= -9), Oe(this), Te(this), _e++;
              var e = be;
              return (be = this), Be.bind(this, e);
            }),
            (Me.prototype.N = function () {
              2 & this.f || ((this.f |= 2), (this.o = ke), (ke = this));
            }),
            (Me.prototype.d = function () {
              (this.f |= 8), 1 & this.f || Re(this);
            });
          class De {
            constructor() {
              this.items = [];
            }
            enqueue(e) {
              this.items.push(e);
            }
            dequeue() {
              return 0 === this.items.length ? null : this.items.shift();
            }
            isEmpty() {
              return 0 === this.items.length;
            }
            size() {
              return this.items.length;
            }
            clear() {
              this.items = [];
            }
          }
          const je = { LOG: 0, INFO: 1, DEBUG: 2, WARN: 3, ERROR: 4, NONE: 5 },
            Le = "ERROR",
            Ue = new (class {
              constructor(e = Le, t = "", r = console) {
                (this.minLogLevel = je[e]),
                  (this.scope = t),
                  (this.logProvider = r);
              }
              log(...e) {
                this.outputLog("LOG", e);
              }
              info(...e) {
                this.outputLog("INFO", e);
              }
              debug(...e) {
                this.outputLog("DEBUG", e);
              }
              warn(...e) {
                this.outputLog("WARN", e);
              }
              error(...e) {
                this.outputLog("ERROR", e);
              }
              outputLog(e, t) {
                this.minLogLevel <= je[e] &&
                  this.logProvider[e.toLowerCase()]?.(...this.formatLogData(t));
              }
              setScope(e) {
                this.scope = e || this.scope;
              }
              setMinLogLevel(e) {
                (this.minLogLevel = je[e]),
                  E(this.minLogLevel) && (this.minLogLevel = je[Le]);
              }
              formatLogData(e) {
                if (Array.isArray(e) && e.length > 0) {
                  let t = "%c RS SDK";
                  this.scope && (t = `${t} - ${this.scope}`),
                    (t = `${t} %c ${_(e[0]) ? e[0].trim() : ""}`);
                  const r = [
                    t,
                    "font-weight: bold; background: black; color: white;",
                    "font-weight: normal;",
                  ];
                  return _(e[0]) || r.push(e[0]), r.push(...e.slice(1)), r;
                }
                return e;
              }
            })(),
            Ne = [
              "localStorage",
              "memoryStorage",
              "cookieStorage",
              "sessionStorage",
              "none",
            ],
            Fe = "cookieStorage",
            Ve = "Unable to process/parse source configuration response.",
            He = (e, t, r) =>
              `${e} due to timeout or no connection (${
                t ? t.type : ""
              }) for URL: ${r}.`,
            Ke = "Failed to invoke the ready callback",
            Ge = "js-integrations",
            Qe = "plugins",
            ze = new RegExp(
              "^(https?:\\/\\/)(((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|localhost|((25[0-5]|2[0-4][0-9]|[0-1]?[0-9]?[0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[0-1]?[0-9]?[0-9]?)))(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*(\\?[;&a-zA-Z\\d%_.~+=-]*)?(\\#[-a-zA-Z\\d_]*)?$"
            ),
            qe = "modern",
            Je = "https://cdn.rudderlabs.com",
            We = "v3",
            Xe = `${Je}/${We}/${qe}/${Ge}`,
            Ze = `${Je}/${We}/${qe}/${Qe}`,
            Ye = "https://api.rudderstack.com",
            et = "bugsnag",
            tt = "v3",
            rt = "xhr",
            nt = {
              oneTrust: "OneTrustConsentManager",
              ketch: "KetchConsentManager",
              custom: "CustomConsentManager",
            },
            it = { [et]: "Bugsnag" },
            st = {
              [tt]: "StorageEncryption",
              legacy: "StorageEncryptionLegacy",
            },
            ot = { [rt]: "XhrQueue", beacon: "BeaconQueue" },
            at = Ie(
              g({
                logLevel: "ERROR",
                configUrl: Ye,
                loadIntegration: !0,
                sessions: { autoTrack: !0, timeout: se },
                sameSiteCookie: "Lax",
                polyfillIfRequired: !0,
                integrations: { All: !0 },
                useBeacon: !1,
                beaconQueueOptions: {},
                destinationsQueueOptions: {},
                queueOptions: {},
                lockIntegrationsVersion: !1,
                lockPluginsVersion: !1,
                uaChTrackLevel: "none",
                plugins: [],
                useGlobalIntegrationsConfigInEvents: !1,
                bufferDataPlaneEventsUntilReady: !1,
                dataPlaneEventsBufferTimeout: 1e4,
                storage: { encryption: { version: tt }, migrate: !0 },
                sendAdblockPageOptions: {},
                useServerSideCookies: !1,
              })
            ),
            lt = {
              userId: "",
              userTraits: {},
              anonymousId: "",
              groupId: "",
              groupTraits: {},
              initialReferrer: "",
              initialReferringDomain: "",
              sessionInfo: {},
              authToken: null,
            },
            ut = { autoTrack: !0, timeout: se },
            ct = {
              userId: Ie(lt.userId),
              userTraits: Ie(lt.userTraits),
              anonymousId: Ie(lt.anonymousId),
              groupId: Ie(lt.groupId),
              groupTraits: Ie(lt.groupTraits),
              initialReferrer: Ie(lt.initialReferrer),
              initialReferringDomain: Ie(lt.initialReferringDomain),
              sessionInfo: Ie(lt.sessionInfo),
              authToken: Ie(lt.authToken),
            },
            dt = {
              isOnline: Ie(!0),
              storage: {
                isLocalStorageAvailable: Ie(!1),
                isCookieStorageAvailable: Ie(!1),
                isSessionStorageAvailable: Ie(!1),
              },
              isBeaconAvailable: Ie(!1),
              isLegacyDOM: Ie(!1),
              isUaCHAvailable: Ie(!1),
              isCryptoAvailable: Ie(!1),
              isIE11: Ie(!1),
              isAdBlocked: Ie(!1),
            },
            ht = {
              isErrorReportingEnabled: Ie(!1),
              isMetricsReportingEnabled: Ie(!1),
              errorReportingProviderPluginName: Ie(void 0),
              isErrorReportingPluginLoaded: Ie(!1),
            },
            gt = Ie(void 0),
            ft = {
              activeDataplaneUrl: Ie(void 0),
              integrationsCDNPath: Ie(Xe),
              pluginsCDNPath: Ie(Ze),
              sourceConfigUrl: Ie(void 0),
              status: Ie(void 0),
              initialized: Ie(!1),
              logLevel: Ie("ERROR"),
              loaded: Ie(!1),
              readyCallbacks: Ie([]),
              writeKey: Ie(void 0),
              dataPlaneUrl: Ie(void 0),
            },
            pt = {
              enabled: Ie(!1),
              initialized: Ie(!1),
              data: Ie({}),
              activeConsentManagerPluginName: Ie(void 0),
              preConsent: Ie({ enabled: !1 }),
              postConsent: Ie({}),
              resolutionStrategy: Ie("and"),
              provider: Ie(void 0),
              metadata: Ie(void 0),
            },
            vt = {
              retries: Ie(0),
              dropped: Ie(0),
              sent: Ie(0),
              queued: Ie(0),
              triggered: Ie(0),
            },
            yt = {
              app: Ie({
                name: Z,
                namespace: "com.rudderlabs.javascript",
                version: Y,
                installType: "npm",
              }),
              traits: Ie(null),
              library: Ie({
                name: Z,
                version: Y,
                snippetVersion: globalThis.RudderSnippetVersion,
              }),
              userAgent: Ie(""),
              device: Ie(null),
              network: Ie(null),
              os: Ie({ name: "", version: "" }),
              locale: Ie(null),
              screen: Ie({
                density: 0,
                width: 0,
                height: 0,
                innerWidth: 0,
                innerHeight: 0,
              }),
              "ua-ch": Ie(void 0),
              timezone: Ie(void 0),
            },
            mt = {
              configuredDestinations: Ie([]),
              activeDestinations: Ie([]),
              loadOnlyIntegrations: Ie({}),
              failedDestinations: Ie([]),
              loadIntegration: Ie(!0),
              initializedDestinations: Ie([]),
              clientDestinationsReady: Ie(!1),
              integrationsConfig: Ie({}),
            },
            bt = { toBeProcessedArray: Ie([]), readyCallbacksArray: Ie([]) },
            kt = {
              ready: Ie(!1),
              loadedPlugins: Ie([]),
              failedPlugins: Ie([]),
              pluginsToLoadFromConfig: Ie([]),
              activePlugins: Ie([]),
              totalPluginsToLoad: Ie(0),
            },
            _t = {
              encryptionPluginName: Ie(void 0),
              migrate: Ie(!1),
              type: Ie(void 0),
              cookie: Ie(void 0),
              entries: Ie({}),
              trulyAnonymousTracking: Ie(!1),
            },
            St = {
              isEnabledServerSideCookies: Ie(!1),
              dataServiceUrl: Ie(void 0),
            },
            Et = { eventsQueuePluginName: Ie(void 0), deliveryEnabled: Ie(!0) },
            wt = {
              ...g({
                capabilities: dt,
                consents: pt,
                context: yt,
                eventBuffer: bt,
                lifecycle: ft,
                loadOptions: at,
                metrics: vt,
                nativeDestinations: mt,
                plugins: kt,
                reporting: ht,
                session: ct,
                source: gt,
                storage: _t,
                serverCookies: St,
                dataPlaneEvents: Et,
              }),
            },
            At = new (class {
              plugins = [];
              byName = {};
              cache = {};
              config = { throws: !0 };
              constructor(e = {}, t) {
                (this.config = { throws: !0, ...e }), (this.logger = t);
              }
              register(e, t) {
                if (!e.name) {
                  const t = `${q}${ce}Plugin name is missing.`;
                  if (this.config.throws) throw new Error(t);
                  this.logger?.error(t, e);
                }
                if (this.byName[e.name]) {
                  const t =
                    ((r = q),
                    (n = e.name),
                    `${r}${ce}Plugin "${n}" already exists.`);
                  if (this.config.throws) throw new Error(t);
                  this.logger?.error(t);
                }
                var r, n;
                (this.cache = {}), (this.plugins = this.plugins.slice());
                let i = this.plugins.length;
                this.plugins.forEach((t, r) => {
                  t.deps?.includes(e.name) && (i = Math.min(i, r));
                }),
                  this.plugins.splice(i, 0, e),
                  (this.byName[e.name] = e),
                  k(e.initialize) && e.initialize(t);
              }
              unregister(e) {
                const t = this.byName[e];
                if (!t) {
                  const t = `${q}${ce}Plugin "${e}" not found.`;
                  if (this.config.throws) throw new Error(t);
                  this.logger?.error(t);
                }
                const r = this.plugins.indexOf(t);
                if (-1 === r) {
                  const t = `${q}${ce}Plugin "${e}" not found in plugins but found in byName. This indicates a bug in the plugin engine. Please report this issue to the development team.`;
                  if (this.config.throws) throw new Error(t);
                  this.logger?.error(t);
                }
                (this.cache = {}),
                  delete this.byName[e],
                  (this.plugins = this.plugins.slice()),
                  this.plugins.splice(r, 1);
              }
              getPlugin(e) {
                return this.byName[e];
              }
              getPlugins(e) {
                const t = e ?? ".";
                return (
                  this.cache[t] ||
                    (this.cache[t] = this.plugins.filter((e) => {
                      if (e.deps?.some((e) => !this.byName[e])) {
                        const t = e.deps.filter((e) => !this.byName[e]);
                        return (
                          this.logger?.error(
                            ((e, t, r) =>
                              `${e}${ce}Plugin "${t}" could not be loaded because some of its dependencies "${r}" do not exist.`)(
                              q,
                              e.name,
                              t
                            )
                          ),
                          !1
                        );
                      }
                      return "." === t || ((e, t) => Boolean(T(e, t)))(e, t);
                    })),
                  this.cache[t]
                );
              }
              processRawPlugins(e) {
                e(this.plugins), (this.cache = {});
              }
              invoke(e, t = !0, ...r) {
                let n = e;
                if (!n)
                  throw new Error(
                    "Failed to invoke plugin because the extension point name is missing."
                  );
                const i = n.startsWith("!"),
                  s = this.config.throws ?? n.endsWith("!");
                if (((n = n.replace(/(^!|!$)/g, "")), !n))
                  throw new Error(
                    "Failed to invoke plugin because the extension point name is invalid."
                  );
                const o = n.split(".");
                o.pop();
                const a = o.join(".");
                return (t ? this.getPlugins(n) : [this.getPlugins(n)[0]]).map(
                  (e) => {
                    const t = T(e, n);
                    if (!k(t) || i) return t;
                    try {
                      return t.apply(T(e, a), r);
                    } catch (t) {
                      if (s) throw t;
                      this.logger?.error(
                        ((e, t, r) =>
                          `${e}${ce}Failed to invoke the "${t}" extension point of plugin "${r}".`)(
                          q,
                          n,
                          e.name
                        ),
                        t
                      );
                    }
                    return null;
                  }
                );
              }
              invokeSingle(e, ...t) {
                return this.invoke(e, !1, ...t)[0];
              }
              invokeMultiple(e, ...t) {
                return this.invoke(e, !0, ...t);
              }
            })({ throws: !0 }, Ue),
            It = "The request failed",
            xt = [It],
            Tt = new (class {
              constructor(e, t) {
                (this.logger = e),
                  (this.pluginEngine = t),
                  (this.errorBuffer = new De()),
                  this.attachEffect();
              }
              attachEffect() {
                if (!0 === wt.reporting.isErrorReportingPluginLoaded.value)
                  for (; this.errorBuffer.size() > 0; )
                    this.errorBuffer.dequeue();
              }
              attachErrorListeners() {
                "addEventListener" in globalThis
                  ? (globalThis.addEventListener("error", (e) => {
                      this.onError(
                        e,
                        void 0,
                        void 0,
                        void 0,
                        "unhandledException"
                      );
                    }),
                    globalThis.addEventListener("unhandledrejection", (e) => {
                      this.onError(
                        e,
                        void 0,
                        void 0,
                        void 0,
                        "unhandledPromiseRejection"
                      );
                    }))
                  : this.logger?.debug(
                      "Failed to attach global error listeners."
                    );
              }
              init(e) {
                if (this.pluginEngine)
                  try {
                    const t = "errorReporting.init",
                      r = this.pluginEngine.invokeSingle(
                        t,
                        wt,
                        this.pluginEngine,
                        e,
                        this.logger
                      );
                    r instanceof Promise &&
                      r
                        .then((e) => {
                          this.errReportingClient = e;
                        })
                        .catch((e) => {
                          this.logger?.error(
                            `${z}${ce}Failed to initialize the error reporting plugin.`,
                            e
                          );
                        });
                  } catch (e) {
                    this.onError(e, z);
                  }
              }
              onError(e, t = "", r = "", n = !1, i = "handled") {
                let s = ((e) => {
                  let t;
                  try {
                    if (_(e)) t = e;
                    else if (e instanceof Error) t = e.message;
                    else if (e instanceof ErrorEvent) t = e.message;
                    else if (e instanceof Event) {
                      const r = e.target;
                      if (r && "script" !== r.localName) return "";
                      if (
                        r?.dataset &&
                        ("RS_JS_SDK" !== r.dataset.loader ||
                          "true" !== r.dataset.isnonnativesdk)
                      )
                        return "";
                      t = `Error in loading a third-party script from URL ${r?.src} with ID ${r?.id}.`;
                    } else t = e.message ? e.message : ge(e);
                  } catch (e) {
                    t = `Unknown error: ${e.message}`;
                  }
                  return t;
                })(e);
                if (!s) return;
                s = `${t}${ce}${r} ${s}`.replace(/ {2,}/g, " ");
                let o = new Error(s);
                if (
                  (x(e) && (o = Object.create(e, { message: { value: s } })),
                  "handled" === i)
                ) {
                  if ((this.notifyError(o), !this.logger)) throw o;
                  if ((this.logger.error(s), n)) throw o;
                }
                wt.reporting.isErrorReportingEnabled.value &&
                  wt.reporting.isErrorReportingPluginLoaded.value;
              }
              leaveBreadcrumb(e) {
                if (this.pluginEngine)
                  try {
                    this.pluginEngine.invokeSingle(
                      "errorReporting.breadcrumb",
                      this.pluginEngine,
                      this.errReportingClient,
                      e,
                      this.logger
                    );
                  } catch (e) {
                    this.onError(e, z, "errorReporting.breadcrumb");
                  }
              }
              notifyError(e) {
                if (
                  this.errReportingClient &&
                  ((e) => !e.message || !xt.some((t) => e.message.includes(t)))(
                    e
                  )
                )
                  try {
                    this.pluginEngine?.invokeSingle(
                      "errorReporting.notify",
                      this.pluginEngine,
                      this.errReportingClient,
                      e,
                      wt,
                      this.logger
                    );
                  } catch (e) {
                    this.logger?.error(
                      `${z}${ce}Failed to notify the error.`,
                      e
                    );
                  }
              }
            })(Ue, At),
            Pt = (e) =>
              Boolean(
                "cloud" !== e.config.connectionMode ||
                  !0 === e.config.useNativeSDKToSend ||
                  !0 === e.config.useNativeSDK
              ),
            Ct = (e) => e.filter(Pt),
            Ot = [
              "BeaconQueue",
              "Bugsnag",
              "CustomConsentManager",
              "DeviceModeDestinations",
              "DeviceModeTransformation",
              "ErrorReporting",
              "ExternalAnonymousId",
              "GoogleLinker",
              "KetchConsentManager",
              "NativeDestinationQueue",
              "OneTrustConsentManager",
              "StorageEncryption",
              "StorageEncryptionLegacy",
              "StorageMigrator",
              "XhrQueue",
            ],
            Rt = {
              rudderAnalyticsRemotePlugins: {
                url: () =>
                  Promise.resolve(
                    window.RudderStackGlobals &&
                      window.RudderStackGlobals.app &&
                      window.RudderStackGlobals.app.pluginsCDNPath
                      ? window.RudderStackGlobals.app.pluginsCDNPath +
                          "/rsa-plugins.js"
                      : "https://cdn.rudderlabs.com/v3/modern/plugins/rsa-plugins.js"
                  ),
                format: "esm",
                from: "vite",
              },
            };
          function Bt(e, t) {
            const r = Object.assign(e, t);
            for (const e of Object.keys(r))
              "object" == typeof r[e] &&
                "object" == typeof t[e] &&
                (r[e] = Bt(r[e], t[e]));
            return r;
          }
          const Mt = (e) =>
            Bt({}, (globalThis.__federation_shared__ || {}).default || {});
          function $t(e, t) {
            if (!e?.default && t) {
              let t = Object.create(null);
              return (t.default = e), (t.__esModule = !0), t;
            }
            return e;
          }
          function Dt(e, t) {
            return (async function (e) {
              const t = Rt[e];
              return t.inited
                ? t.lib
                : "var" === t.format
                ? new Promise((r) =>
                    (async (e, t) => {
                      const r = "function" == typeof e ? await e() : e,
                        n = document.createElement("script");
                      (n.type = "text/javascript"),
                        (n.onload = t),
                        (n.src = r),
                        document.getElementsByTagName("head")[0].appendChild(n);
                    })(t.url, () => {
                      t.inited ||
                        ((t.lib = window[e]),
                        t.lib.init(Mt(t.from)),
                        (t.inited = !0)),
                        r(t.lib);
                    })
                  )
                : ["esm", "systemjs"].includes(t.format)
                ? new Promise((e, r) => {
                    ("function" == typeof t.url
                      ? t.url
                      : () => Promise.resolve(t.url))().then((n) => {
                      import(n)
                        .then((r) => {
                          if (!t.inited) {
                            const e = Mt(t.from);
                            r.init(e),
                              (t.lib = r),
                              t.lib.init(e),
                              (t.inited = !0);
                          }
                          e(t.lib);
                        })
                        .catch(r);
                    });
                  })
                : void 0;
            })(e).then((e) => e.get(t).then((e) => e()));
          }
          const jt = (e) =>
              ((e) => {
                const t = {};
                return (
                  e.forEach((e) => {
                    if (Ot.includes(e)) {
                      const r = ((e) => {
                        switch (e) {
                          case "BeaconQueue":
                            return () =>
                              Dt(
                                "rudderAnalyticsRemotePlugins",
                                "./BeaconQueue"
                              ).then((e) => $t(e, !0));
                          case "Bugsnag":
                            return () =>
                              Dt(
                                "rudderAnalyticsRemotePlugins",
                                "./Bugsnag"
                              ).then((e) => $t(e, !0));
                          case "CustomConsentManager":
                            return () =>
                              Dt(
                                "rudderAnalyticsRemotePlugins",
                                "./CustomConsentManager"
                              ).then((e) => $t(e, !0));
                          case "DeviceModeDestinations":
                            return () =>
                              Dt(
                                "rudderAnalyticsRemotePlugins",
                                "./DeviceModeDestinations"
                              ).then((e) => $t(e, !0));
                          case "DeviceModeTransformation":
                            return () =>
                              Dt(
                                "rudderAnalyticsRemotePlugins",
                                "./DeviceModeTransformation"
                              ).then((e) => $t(e, !0));
                          case "ErrorReporting":
                            return () =>
                              Dt(
                                "rudderAnalyticsRemotePlugins",
                                "./ErrorReporting"
                              ).then((e) => $t(e, !0));
                          case "ExternalAnonymousId":
                            return () =>
                              Dt(
                                "rudderAnalyticsRemotePlugins",
                                "./ExternalAnonymousId"
                              ).then((e) => $t(e, !0));
                          case "GoogleLinker":
                            return () =>
                              Dt(
                                "rudderAnalyticsRemotePlugins",
                                "./GoogleLinker"
                              ).then((e) => $t(e, !0));
                          case "KetchConsentManager":
                            return () =>
                              Dt(
                                "rudderAnalyticsRemotePlugins",
                                "./KetchConsentManager"
                              ).then((e) => $t(e, !0));
                          case "NativeDestinationQueue":
                            return () =>
                              Dt(
                                "rudderAnalyticsRemotePlugins",
                                "./NativeDestinationQueue"
                              ).then((e) => $t(e, !0));
                          case "OneTrustConsentManager":
                            return () =>
                              Dt(
                                "rudderAnalyticsRemotePlugins",
                                "./OneTrustConsentManager"
                              ).then((e) => $t(e, !0));
                          case "StorageEncryption":
                            return () =>
                              Dt(
                                "rudderAnalyticsRemotePlugins",
                                "./StorageEncryption"
                              ).then((e) => $t(e, !0));
                          case "StorageEncryptionLegacy":
                            return () =>
                              Dt(
                                "rudderAnalyticsRemotePlugins",
                                "./StorageEncryptionLegacy"
                              ).then((e) => $t(e, !0));
                          case "StorageMigrator":
                            return () =>
                              Dt(
                                "rudderAnalyticsRemotePlugins",
                                "./StorageMigrator"
                              ).then((e) => $t(e, !0));
                          case "XhrQueue":
                            return () =>
                              Dt(
                                "rudderAnalyticsRemotePlugins",
                                "./XhrQueue"
                              ).then((e) => $t(e, !0));
                          default:
                            return;
                        }
                      })(e);
                      r && (t[e] = r);
                    }
                  }),
                  t
                );
              })?.(e) || {},
            Lt = {};
          class Ut {
            constructor(e, t, r) {
              (this.engine = e),
                (this.errorHandler = t),
                (this.logger = r),
                (this.onError = this.onError.bind(this));
            }
            init() {
              (wt.lifecycle.status.value = "pluginsLoading"),
                ae("pluginsCDNPath", wt.lifecycle.pluginsCDNPath.value),
                this.setActivePlugins(),
                this.registerLocalPlugins(),
                this.registerRemotePlugins(),
                this.attachEffects();
            }
            attachEffects() {
              $e(() => {
                (0 === wt.plugins.activePlugins.value.length ||
                  wt.plugins.loadedPlugins.value.length +
                    wt.plugins.failedPlugins.value.length ===
                    wt.plugins.totalPluginsToLoad.value) &&
                  me(() => {
                    (wt.plugins.ready.value = !0),
                      (wt.lifecycle.status.value = "pluginsReady");
                  });
              });
            }
            getPluginsToLoadBasedOnConfig() {
              let e = wt.plugins.pluginsToLoadFromConfig.value;
              if (!e) return [];
              return (
                [
                  {
                    configurationStatus: () =>
                      A(wt.dataPlaneEvents.eventsQueuePluginName.value),
                    configurationStatusStr:
                      "Data plane events delivery is enabled",
                    activePluginName:
                      wt.dataPlaneEvents.eventsQueuePluginName.value,
                    supportedPlugins: Object.values(ot),
                    shouldAddMissingPlugins: !0,
                  },
                  {
                    configurationStatus: () =>
                      A(wt.reporting.errorReportingProviderPluginName.value),
                    configurationStatusStr: "Error reporting is enabled",
                    activePluginName:
                      wt.reporting.errorReportingProviderPluginName.value,
                    basePlugins: ["ErrorReporting"],
                    supportedPlugins: Object.values(it),
                  },
                  {
                    configurationStatus: () =>
                      Ct(wt.nativeDestinations.configuredDestinations.value)
                        .length > 0,
                    configurationStatusStr:
                      "Device mode destinations are connected to the source",
                    supportedPlugins: [
                      "DeviceModeDestinations",
                      "NativeDestinationQueue",
                    ],
                  },
                  {
                    configurationStatus: () =>
                      Ct(
                        wt.nativeDestinations.configuredDestinations.value
                      ).some((e) => e.shouldApplyDeviceModeTransformation),
                    configurationStatusStr:
                      "Device mode transformations are enabled for at least one destination",
                    supportedPlugins: ["DeviceModeTransformation"],
                  },
                  {
                    configurationStatus: () =>
                      A(wt.consents.activeConsentManagerPluginName.value),
                    configurationStatusStr: "Consent management is enabled",
                    activePluginName:
                      wt.consents.activeConsentManagerPluginName.value,
                    supportedPlugins: Object.values(nt),
                  },
                  {
                    configurationStatus: () =>
                      A(wt.storage.encryptionPluginName.value),
                    configurationStatusStr: "Storage encryption is enabled",
                    activePluginName: wt.storage.encryptionPluginName.value,
                    supportedPlugins: Object.values(st),
                  },
                  {
                    configurationStatus: () => wt.storage.migrate.value,
                    configurationStatusStr: "Storage migration is enabled",
                    supportedPlugins: ["StorageMigrator"],
                  },
                ].forEach((t) => {
                  t.configurationStatus()
                    ? ((e = e.filter(
                        t.activePluginName
                          ? (e) =>
                              !(
                                e !== t.activePluginName &&
                                t.supportedPlugins.includes(e)
                              )
                          : (e) => A(e)
                      )),
                      this.addMissingPlugins(t, !1, e))
                    : (e = e.filter(
                        void 0 !== t.basePlugins
                          ? (e) =>
                              !(
                                t.basePlugins.includes(e) ||
                                t.supportedPlugins.includes(e)
                              )
                          : (e) => !t.supportedPlugins.includes(e)
                      ));
                }),
                [...Object.keys({}), ...e]
              );
            }
            addMissingPlugins(e, t, r) {
              const n = e.shouldAddMissingPlugins || t;
              let i;
              i = e.activePluginName
                ? [...(e.basePlugins || []), e.activePluginName]
                : [...e.supportedPlugins];
              const s = i.filter((e) => !r.includes(e));
              s.length > 0 &&
                (n && r.push(...s),
                this.logger?.warn(
                  ((e, t, r, n) => {
                    const i = 1 === r.length,
                      s = i
                        ? ` '${r[0]}' plugin was`
                        : ` ['${r.join("', '")}'] plugins were`,
                      o = `${e}${ce}${t}, but${s} not configured to load.`;
                    return n
                      ? `${o} So, ${
                          i ? "the plugin" : "those plugins"
                        } will be loaded automatically.`
                      : `${o} Ignore if this was intentional. Otherwise, consider adding ${
                          i ? "it" : "them"
                        } to the 'plugins' load API option.`;
                  })(G, e.configurationStatusStr, s, n)
                ));
            }
            setActivePlugins() {
              const e = this.getPluginsToLoadBasedOnConfig(),
                t = [...Object.keys(Lt), ...Ot],
                r = [],
                n = [];
              e.forEach((e) => {
                t.includes(e) ? r.push(e) : n.push(e);
              }),
                n.length > 0 &&
                  this.onError(
                    new Error(
                      `Ignoring loading of unknown plugins: ${n.join(
                        ","
                      )}. Mandatory plugins: ${Object.keys({}).join(
                        ","
                      )}. Load option plugins: ${wt.plugins.pluginsToLoadFromConfig.value.join(
                        ","
                      )}`
                    )
                  ),
                me(() => {
                  (wt.plugins.totalPluginsToLoad.value = e.length),
                    (wt.plugins.activePlugins.value = r),
                    (wt.plugins.failedPlugins.value = n);
                });
            }
            registerLocalPlugins() {
              Object.values(Lt).forEach((e) => {
                k(e) &&
                  wt.plugins.activePlugins.value.includes(e().name) &&
                  this.register([e()]);
              });
            }
            registerRemotePlugins() {
              const e = ((t = wt.plugins.activePlugins.value), { ...jt(t) });
              var t;
              Promise.all(
                Object.keys(e).map(async (t) => {
                  await e[t]()
                    .then((e) => this.register([e.default()]))
                    .catch((e) => {
                      (wt.plugins.failedPlugins.value = [
                        ...wt.plugins.failedPlugins.value,
                        t,
                      ]),
                        this.onError(e, t);
                    });
                })
              ).catch((e) => {
                this.onError(e);
              });
            }
            invokeMultiple(e, ...t) {
              try {
                return this.engine.invokeMultiple(e, ...t);
              } catch (t) {
                return this.onError(t, e), [];
              }
            }
            invokeSingle(e, ...t) {
              try {
                return this.engine.invokeSingle(e, ...t);
              } catch (t) {
                return this.onError(t, e), null;
              }
            }
            register(e) {
              e.forEach((e) => {
                try {
                  this.engine.register(e, wt);
                } catch (t) {
                  (wt.plugins.failedPlugins.value = [
                    ...wt.plugins.failedPlugins.value,
                    e.name,
                  ]),
                    this.onError(t);
                }
              });
            }
            unregisterLocalPlugins() {
              Object.values(Lt).forEach((e) => {
                try {
                  this.engine.unregister(e().name);
                } catch (e) {
                  this.onError(e);
                }
              });
            }
            onError(e, t) {
              if (!this.errorHandler) throw e;
              this.errorHandler.onError(e, G, t);
            }
          }
          const Nt = (e, t) => {
              try {
                return JSON.parse(e || "");
              } catch (e) {
                const r = fe(e, "Failed to parse response data");
                if (!k(t)) throw r;
                t(r);
              }
            },
            Ft = {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
              },
              method: "GET",
            },
            Vt = (e, t, r) => {
              const n = R(Ft, t || {});
              return (
                r && (n.headers = R(n.headers, { Authorization: r })),
                (n.url = e),
                n
              );
            },
            Ht = (e, t = 1e4, r) =>
              new Promise((n, i) => {
                let s;
                if (!0 === e.sendRawData) s = e.data;
                else if (((s = ge(e.data, !1, [], r)), S(s)))
                  return void i({
                    error: new Error("Failed to prepare data for the request."),
                    undefined: void 0,
                    options: e,
                  });
                const o = new XMLHttpRequest(),
                  a = (t) => {
                    i({
                      error: new Error(He(It, t, e.url)),
                      xhr: o,
                      options: e,
                    });
                  };
                (o.ontimeout = a),
                  (o.onerror = a),
                  (o.onload = () => {
                    var t, r, s, a;
                    o.status >= 200 && o.status < 400
                      ? n({ response: o.responseText, xhr: o, options: e })
                      : i({
                          error: new Error(
                            ((t = It),
                            (r = o.status),
                            (s = o.statusText),
                            (a = e.url),
                            `${t} with status: ${r}, ${s} for URL: ${a}.`)
                          ),
                          xhr: o,
                          options: e,
                        });
                  }),
                  o.open(e.method, e.url),
                  !0 === e.withCredentials && (o.withCredentials = !0),
                  (o.timeout = t),
                  Object.keys(e.headers).forEach((t) => {
                    e.headers[t] && o.setRequestHeader(t, e.headers[t]);
                  });
                try {
                  o.send(s);
                } catch (t) {
                  i({
                    error: fe(t, ((l = It), (u = e.url), `${l} for URL: ${u}`)),
                    xhr: o,
                    options: e,
                  });
                }
                var l, u;
              });
          class Kt {
            hasErrorHandler = !1;
            constructor(e, t) {
              (this.errorHandler = e),
                (this.logger = t),
                (this.hasErrorHandler = Boolean(this.errorHandler)),
                (this.onError = this.onError.bind(this));
            }
            async getData(e) {
              const { url: t, options: r, timeout: n, isRawResponse: i } = e;
              try {
                const e = await Ht(
                  Vt(t, r, this.basicAuthHeader),
                  n,
                  this.logger
                );
                return {
                  data: i ? e.response : Nt(e.response, this.onError),
                  details: e,
                };
              } catch (e) {
                return this.onError(e.error ?? e), { data: void 0, details: e };
              }
            }
            getAsyncData(e) {
              const {
                  callback: t,
                  url: r,
                  options: n,
                  timeout: i,
                  isRawResponse: s,
                } = e,
                o = !k(t);
              Ht(Vt(r, n, this.basicAuthHeader), i, this.logger)
                .then((e) => {
                  o || t(s ? e.response : Nt(e.response, this.onError), e);
                })
                .catch((e) => {
                  this.onError(e.error ?? e), o || t(void 0, e);
                });
            }
            onError(e) {
              if (!this.hasErrorHandler) throw e;
              this.errorHandler?.onError(e, "HttpClient");
            }
            setAuthHeader(e, t = !1) {
              const r = t
                ? e
                : ((e) =>
                    ((e) => {
                      const t = Array.from(e, (e) =>
                        String.fromCodePoint(e)
                      ).join("");
                      return globalThis.btoa(t);
                    })(new TextEncoder().encode(e)))(`${e}:`);
              this.basicAuthHeader = `Basic ${r}`;
            }
            resetAuthHeader() {
              this.basicAuthHeader = void 0;
            }
          }
          const Gt = new Kt(Tt, Ue),
            Qt = "cookieStorage",
            zt = "localStorage",
            qt = "sessionStorage",
            Jt = "memoryStorage",
            Wt = "none",
            Xt = {
              userId: "rl_user_id",
              userTraits: "rl_trait",
              anonymousId: "rl_anonymous_id",
              groupId: "rl_group_id",
              groupTraits: "rl_group_trait",
              initialReferrer: "rl_page_init_referrer",
              initialReferringDomain: "rl_page_init_referring_domain",
              sessionInfo: "rl_session",
              authToken: "rl_auth_token",
            },
            Zt = "clientDataInCookie",
            Yt = "clientDataInLocalStorage",
            er = "clientDataInSessionStorage",
            tr = [
              "userId",
              "userTraits",
              "anonymousId",
              "groupId",
              "groupTraits",
              "initialReferrer",
              "initialReferringDomain",
              "sessionInfo",
              "authToken",
            ],
            rr = { [Qt]: Zt, [zt]: Yt, [Jt]: "clientDataInMemory", [qt]: er },
            nr = (e, t) => {
              try {
                return encodeURIComponent(e);
              } catch (e) {
                return void t?.error("Failed to encode the cookie data.", e);
              }
            },
            ir = (e) => {
              try {
                return decodeURIComponent(e);
              } catch (e) {
                return;
              }
            },
            sr = () =>
              ((e) => {
                const t = {},
                  r = e.split(/\s*;\s*/);
                let n;
                return r[0]
                  ? (r.forEach((e) => {
                      n = e.split("=");
                      const r = n[0] ? ir(n[0]) : void 0;
                      r && (t[r] = n[1] ? ir(n[1]) : void 0);
                    }),
                    t)
                  : t;
              })(globalThis.document.cookie),
            or = function (e, t, r, n) {
              switch (arguments.length) {
                case 4:
                case 3:
                case 2:
                  return ((e, t, r, n) => {
                    const i = { ...(r || {}) };
                    let s = `${nr(e, n)}=${nr(t, n)}`;
                    S(t) && (i.maxage = -1),
                      i.maxage &&
                        (i.expires = new Date(+new Date() + i.maxage)),
                      i.path && (s += `; path=${i.path}`),
                      i.domain && (s += `; domain=${i.domain}`),
                      i.expires &&
                        (s += `; expires=${i.expires.toUTCString()}`),
                      i.samesite && (s += `; samesite=${i.samesite}`),
                      i.secure && (s += "; secure"),
                      (globalThis.document.cookie = s);
                  })(e, t, r, n);
                case 1:
                  return e ? ((e) => sr()[e])(e) : sr();
                default:
                  return sr();
              }
            },
            ar = () => !w(globalThis.navigator.userAgentData),
            lr = {
              URL: () => !k(globalThis.URL) || !k(globalThis.URLSearchParams),
              Promise: () => !k(globalThis.Promise),
              "Number.isNaN": () => !k(globalThis.Number.isNaN),
              "Number.isInteger": () => !k(globalThis.Number.isInteger),
              "Array.from": () => !k(globalThis.Array.from),
              "Array.prototype.find": () => !k(globalThis.Array.prototype.find),
              "Array.prototype.includes": () =>
                !k(globalThis.Array.prototype.includes),
              "String.prototype.endsWith": () =>
                !k(globalThis.String.prototype.endsWith),
              "String.prototype.startsWith": () =>
                !k(globalThis.String.prototype.startsWith),
              "String.prototype.includes": () =>
                !k(globalThis.String.prototype.includes),
              "String.prototype.replaceAll": () =>
                !k(globalThis.String.prototype.replaceAll),
              "String.fromCodePoint": () => !k(globalThis.String.fromCodePoint),
              "Object.entries": () => !k(globalThis.Object.entries),
              "Object.values": () => !k(globalThis.Object.values),
              "Object.assign": () => !k(globalThis.Object.assign),
              "Object.fromEntries": () => !k(globalThis.Object.fromEntries),
              "Element.prototype.dataset": () =>
                !(() => {
                  const e = globalThis.document.createElement("div");
                  return (
                    e.setAttribute("data-a-b", "c"),
                    !!e.dataset && "c" === e.dataset.aB
                  );
                })(),
              TextEncoder: () =>
                !k(globalThis.TextEncoder) || !k(globalThis.TextDecoder),
              requestAnimationFrame: () =>
                !k(globalThis.requestAnimationFrame) ||
                !k(globalThis.cancelAnimationFrame),
              CustomEvent: () => !k(globalThis.CustomEvent),
              "navigator.sendBeacon": () => !k(globalThis.navigator.sendBeacon),
              ArrayBuffer: () => !k(globalThis.Uint8Array),
              Set: () => !k(globalThis.Set),
              atob: () => !k(globalThis.atob),
            },
            ur = () => {
              let e = {
                density: 0,
                width: 0,
                height: 0,
                innerWidth: 0,
                innerHeight: 0,
              };
              return (
                (e = {
                  width: globalThis.screen.width,
                  height: globalThis.screen.height,
                  density: globalThis.devicePixelRatio,
                  innerWidth: globalThis.innerWidth,
                  innerHeight: globalThis.innerHeight,
                }),
                e
              );
            },
            cr = (e) => {
              const t =
                ["QuotaExceededError", "NS_ERROR_DOM_QUOTA_REACHED"].includes(
                  e.name
                ) || [22, 1014].includes(e.code);
              return e instanceof DOMException && t;
            },
            dr = (e = zt, t, r) => {
              let n, i;
              try {
                switch (e) {
                  case Jt:
                    return !0;
                  case Qt:
                    (n = t), (i = "test_rudder_cookie");
                    break;
                  case zt:
                    (n = t ?? globalThis.localStorage), (i = "test_rudder_ls");
                    break;
                  case qt:
                    (n = t ?? globalThis.sessionStorage),
                      (i = "test_rudder_ss");
                    break;
                  default:
                    return !1;
                }
                return (
                  !!n &&
                  (n.setItem(i, "true"),
                  !!n.getItem(i) && (n.removeItem(i), !0))
                );
              } catch (t) {
                const n = `${V}${ce}The "${e}" storage type is `;
                let i = "unavailable";
                return cr(t) && (i = "full"), r?.warn(`${n}${i}.`, t), !1;
              }
            },
            hr = () => {
              const e = `.${((e) => {
                const t = ((e) => {
                  const t =
                      "function" != typeof globalThis.URL
                        ? ((e) => {
                            const t = document.createElement("a");
                            return (t.href = e), t.hostname;
                          })(e)
                        : new URL(e).hostname,
                    r = t?.split(".") ?? [],
                    n = r[r.length - 1],
                    i = [];
                  if (4 === r.length && n && n === parseInt(n, 10).toString())
                    return i;
                  if (r.length <= 1)
                    return r[0] && -1 !== r[0].indexOf("localhost")
                      ? ["localhost"]
                      : i;
                  for (let e = r.length - 2; e >= 0; e -= 1)
                    i.push(r.slice(e).join("."));
                  return i;
                })(globalThis.location.href);
                for (let e = 0; e < t.length; e += 1) {
                  const r = t[e],
                    n = "__tld__",
                    i = {
                      domain: `${-1 !== r.indexOf("localhost") ? "" : "."}${r}`,
                    };
                  if ((or(n, 1, i), or(n))) return or(n, null, i), r;
                }
                return "";
              })()}`;
              return {
                maxage: 31536e6,
                path: "/",
                domain: e && "." !== e ? e : void 0,
                samesite: "Lax",
                enabled: !0,
              };
            };
          class gr {
            static globalSingleton = null;
            isSupportAvailable = !0;
            isEnabled = !0;
            length = 0;
            constructor(e = {}, t) {
              if (gr.globalSingleton) return gr.globalSingleton;
              (this.options = hr()),
                (this.logger = t),
                this.configure(e),
                (gr.globalSingleton = this);
            }
            configure(e) {
              return (
                (this.options = R(this.options ?? {}, e)),
                e.sameDomainCookiesOnly && delete this.options.domain,
                (this.isSupportAvailable = dr(Qt, this, this.logger)),
                (this.isEnabled = Boolean(
                  this.options.enabled && this.isSupportAvailable
                )),
                this.options
              );
            }
            setItem(e, t) {
              return (
                or(e, t, this.options, this.logger),
                (this.length = Object.keys(or()).length),
                !0
              );
            }
            getItem(e) {
              const t = or(e);
              return E(t) ? null : t;
            }
            removeItem(e) {
              const t = this.setItem(e, null);
              return (this.length = Object.keys(or()).length), t;
            }
            clear() {}
            key(e) {
              return this.keys()[e] ?? null;
            }
            keys() {
              return Object.keys(or());
            }
          }
          const fr = new (class {
            isEnabled = !0;
            length = 0;
            data = {};
            constructor(e, t) {
              (this.options = { enabled: !0 }),
                (this.logger = t),
                this.configure(e ?? {});
            }
            configure(e) {
              return (
                (this.options = R(this.options, e)),
                (this.isEnabled = Boolean(this.options.enabled)),
                this.options
              );
            }
            setItem(e, t) {
              return (
                (this.data[e] = t),
                (this.length = Object.keys(this.data).length),
                t
              );
            }
            getItem(e) {
              return e in this.data ? this.data[e] : null;
            }
            removeItem(e) {
              return (
                e in this.data && delete this.data[e],
                (this.length = Object.keys(this.data).length),
                null
              );
            }
            clear() {
              (this.data = {}), (this.length = 0);
            }
            key(e) {
              return this.keys()[e] ?? null;
            }
            keys() {
              return Object.keys(this.data);
            }
          })({}, Ue);
          function pr(e) {
            return e &&
              e.__esModule &&
              Object.prototype.hasOwnProperty.call(e, "default")
              ? e.default
              : e;
          }
          "undefined" != typeof globalThis
            ? globalThis
            : "undefined" != typeof window
            ? window
            : void 0 !== r.g
            ? r.g
            : "undefined" != typeof self && self;
          var vr = { exports: {} };
          !(function (e, t) {
            e.exports = (function () {
              function e(e) {
                return (e = JSON.stringify(e)), !!/^\{[\s\S]*\}$/.test(e);
              }
              function t(e) {
                if ("string" == typeof e)
                  try {
                    return JSON.parse(e);
                  } catch (t) {
                    return e;
                  }
              }
              function r(e) {
                return "[object Function]" === {}.toString.call(e);
              }
              var n = (function (e) {
                var t = "_Is_Incognit";
                try {
                  e || (e = window.localStorage),
                    e.setItem(t, "yes"),
                    e.removeItem(t);
                } catch (t) {
                  var r = {
                    _data: {},
                    setItem: function (e, t) {
                      return (r._data[e] = String(t));
                    },
                    getItem: function (e) {
                      return r._data.hasOwnProperty(e) ? r._data[e] : void 0;
                    },
                    removeItem: function (e) {
                      return delete r._data[e];
                    },
                    clear: function () {
                      return (r._data = {});
                    },
                  };
                  e = r;
                } finally {
                  "yes" === e.getItem(t) && e.removeItem(t);
                }
                return e;
              })();
              function i() {
                if (!(this instanceof i)) return new i();
              }
              i.prototype = {
                set: function (t, r) {
                  if (t && !e(t))
                    n.setItem(
                      t,
                      (function (e) {
                        return void 0 === e || "function" == typeof e
                          ? e + ""
                          : JSON.stringify(e);
                      })(r)
                    );
                  else if (e(t)) for (var i in t) this.set(i, t[i]);
                  return this;
                },
                get: function (e) {
                  if (void 0 === e) {
                    var r = {};
                    return (
                      this.forEach(function (e, t) {
                        return (r[e] = t);
                      }),
                      r
                    );
                  }
                  if ("?" === e.charAt(0)) return this.has(e.substr(1));
                  var i = arguments;
                  if (i.length > 1) {
                    for (var s = {}, o = 0, a = i.length; o < a; o++) {
                      var l = t(n.getItem(i[o]));
                      this.has(i[o]) && (s[i[o]] = l);
                    }
                    return s;
                  }
                  return t(n.getItem(e));
                },
                clear: function () {
                  return n.clear(), this;
                },
                remove: function (e) {
                  var t = this.get(e);
                  return n.removeItem(e), t;
                },
                has: function (e) {
                  return {}.hasOwnProperty.call(this.get(), e);
                },
                keys: function () {
                  var e = [];
                  return (
                    this.forEach(function (t) {
                      e.push(t);
                    }),
                    e
                  );
                },
                forEach: function (e) {
                  for (var t = 0, r = n.length; t < r; t++) {
                    var i = n.key(t);
                    e(i, this.get(i));
                  }
                  return this;
                },
                search: function (e) {
                  for (
                    var t = this.keys(), r = {}, n = 0, i = t.length;
                    n < i;
                    n++
                  )
                    t[n].indexOf(e) > -1 && (r[t[n]] = this.get(t[n]));
                  return r;
                },
                len: function () {
                  return n.length;
                },
              };
              var s = null;
              function o(t, n) {
                var a,
                  l = arguments,
                  u = null;
                if ((s || (s = i()), 0 === l.length)) return s.get();
                if (1 === l.length) {
                  if ("string" == typeof t) return s.get(t);
                  if (e(t)) return s.set(t);
                }
                if (2 === l.length && "string" == typeof t) {
                  if (!n) return s.remove(t);
                  if (n && "string" == typeof n) return s.set(t, n);
                  n && r(n) && ((u = null), (u = n(t, s.get(t))), o.set(t, u));
                }
                if (
                  2 === l.length &&
                  ((a = t),
                  "[object Array]" === Object.prototype.toString.call(a)) &&
                  r(n)
                )
                  for (var c = 0, d = t.length; c < d; c++)
                    (u = n(t[c], s.get(t[c]))), o.set(t[c], u);
                return o;
              }
              for (var a in i.prototype) o[a] = i.prototype[a];
              return o;
            })();
          })(vr);
          const yr = pr(vr.exports),
            mr = new (class {
              isSupportAvailable = !0;
              isEnabled = !0;
              length = 0;
              constructor(e = {}, t) {
                (this.options = { enabled: !0 }),
                  (this.logger = t),
                  this.configure(e);
              }
              configure(e) {
                return (
                  (this.options = R(this.options, e)),
                  (this.isSupportAvailable = dr(zt, this, this.logger)),
                  (this.isEnabled = Boolean(
                    this.options.enabled && this.isSupportAvailable
                  )),
                  this.options
                );
              }
              setItem(e, t) {
                yr.set(e, t), (this.length = yr.len());
              }
              getItem(e) {
                const t = yr.get(e);
                return E(t) ? null : t;
              }
              removeItem(e) {
                yr.remove(e), (this.length = yr.len());
              }
              clear() {
                yr.clear(), (this.length = 0);
              }
              key(e) {
                return this.keys()[e] ?? null;
              }
              keys() {
                return yr.keys();
              }
            })({}, Ue),
            br = new (class {
              isSupportAvailable = !0;
              isEnabled = !0;
              length = 0;
              store = globalThis.sessionStorage;
              constructor(e = {}, t) {
                (this.options = { enabled: !0 }),
                  (this.logger = t),
                  this.configure(e);
              }
              configure(e) {
                return (
                  (this.options = R(this.options, e)),
                  (this.isSupportAvailable = dr(qt, this, this.logger)),
                  (this.isEnabled = Boolean(
                    this.options.enabled && this.isSupportAvailable
                  )),
                  this.options
                );
              }
              setItem(e, t) {
                this.store.setItem(e, t), (this.length = this.store.length);
              }
              getItem(e) {
                const t = this.store.getItem(e);
                return E(t) ? null : t;
              }
              removeItem(e) {
                this.store.removeItem(e), (this.length = this.store.length);
              }
              clear() {
                this.store.clear(), (this.length = 0);
              }
              key(e) {
                return this.store.key(e);
              }
              keys() {
                const e = [];
                for (let t = 0; t < this.store.length; t += 1) {
                  const r = this.store.key(t);
                  null !== r && e.push(r);
                }
                return e;
              }
            })({}, Ue),
            kr = (e) => {
              switch (e) {
                case zt:
                  return mr;
                case qt:
                  return br;
                case Jt:
                  return fr;
                case Qt:
                  return new gr({}, Ue);
                default:
                  return fr;
              }
            };
          class _r {
            hasErrorHandler = !1;
            constructor(e, t, r) {
              (this.id = e.id),
                (this.name = e.name),
                (this.isEncrypted = e.isEncrypted ?? !1),
                (this.validKeys = e.validKeys ?? {}),
                (this.engine = t ?? kr(zt)),
                (this.noKeyValidation =
                  0 === Object.keys(this.validKeys).length),
                (this.noCompoundKey = e.noCompoundKey),
                (this.originalEngine = this.engine),
                (this.errorHandler = e.errorHandler ?? Tt),
                (this.hasErrorHandler = Boolean(this.errorHandler)),
                (this.logger = e.logger ?? Ue),
                (this.pluginsManager = r);
            }
            createValidKey(e) {
              const {
                name: t,
                id: r,
                validKeys: n,
                noKeyValidation: i,
                noCompoundKey: s,
              } = this;
              if (i) return s ? e : [t, r, e].join(".");
              let o;
              return (
                Object.values(n).forEach((n) => {
                  n === e && (o = s ? e : [t, r, e].join("."));
                }),
                o
              );
            }
            swapQueueStoreToInMemoryEngine() {
              const { name: e, id: t, validKeys: r, noCompoundKey: n } = this,
                i = kr(Jt);
              Object.keys(r).forEach((s) => {
                const o = this.get(r[s]),
                  a = n ? s : [e, t, s].join(".");
                i.setItem(a, o), this.remove(s);
              }),
                (this.engine = i);
            }
            set(e, t) {
              const r = this.createValidKey(e);
              if (r)
                try {
                  this.engine.setItem(
                    r,
                    this.encrypt(ge(t, !1, [], this.logger))
                  );
                } catch (r) {
                  cr(r)
                    ? (this.logger?.warn(
                        `Store ${this.id}${ce}The storage is either full or unavailable, so the data will not be persisted. Switching to in-memory storage.`
                      ),
                      this.swapQueueStoreToInMemoryEngine(),
                      this.set(e, t))
                    : this.onError(
                        fe(
                          r,
                          ((e) =>
                            `Failed to save the value for "${e}" to storage`)(e)
                        )
                      );
                }
            }
            get(e) {
              const t = this.createValidKey(e);
              try {
                if (!t) return null;
                const e = this.decrypt(this.engine.getItem(t));
                return w(e) ? null : JSON.parse(e);
              } catch (t) {
                return (
                  this.onError(
                    new Error(
                      `${((e) =>
                        `Failed to retrieve or parse data for "${e}" from storage`)(
                        e
                      )}: ${t.message}`
                    )
                  ),
                  null
                );
              }
            }
            remove(e) {
              const t = this.createValidKey(e);
              t && this.engine.removeItem(t);
            }
            getOriginalEngine() {
              return this.originalEngine;
            }
            decrypt(e) {
              return w(e) ? null : this.crypto(e, "decrypt");
            }
            encrypt(e) {
              return this.crypto(e, "encrypt");
            }
            crypto(e, t) {
              const r =
                !this.isEncrypted ||
                !e ||
                "string" != typeof e ||
                "" === ((e) => e.replace(/^\s+|\s+$/gm, ""))(e);
              if (r) return e;
              const n = `storage.${t}`,
                i = this.pluginsManager
                  ? this.pluginsManager.invokeSingle(n, e)
                  : e;
              return void 0 === i ? e : i ?? "";
            }
            onError(e) {
              if (!this.hasErrorHandler) throw e;
              this.errorHandler?.onError(e, `Store ${this.id}`);
            }
          }
          class Sr {
            stores = {};
            isInitialized = !1;
            hasErrorHandler = !1;
            constructor(e, t, r) {
              (this.errorHandler = t),
                (this.logger = r),
                (this.hasErrorHandler = Boolean(this.errorHandler)),
                (this.pluginsManager = e),
                (this.onError = this.onError.bind(this));
            }
            init() {
              if (this.isInitialized) return;
              const e = wt.loadOptions.value,
                t = {
                  cookieStorageOptions: {
                    samesite: e.sameSiteCookie,
                    secure: e.secureCookie,
                    domain: e.setCookieDomain,
                    sameDomainCookiesOnly: e.sameDomainCookiesOnly,
                    enabled: !0,
                  },
                  localStorageOptions: { enabled: !0 },
                  inMemoryStorageOptions: { enabled: !0 },
                  sessionStorageOptions: { enabled: !0 },
                };
              ((e = {}, t = {}, r = {}, n = {}) => {
                var i;
                ((e) => {
                  const t = new gr({}, Ue).configure(e);
                  wt.storage.cookie.value = {
                    maxage: t.maxage,
                    path: t.path,
                    domain: t.domain,
                    samesite: t.samesite,
                    expires: t.expires,
                    secure: t.secure,
                  };
                })(e),
                  (i = t),
                  mr.configure(i),
                  ((e) => {
                    fr.configure(e);
                  })(r),
                  ((e) => {
                    br.configure(e);
                  })(n);
              })(
                M(
                  R(
                    t.cookieStorageOptions ?? {},
                    wt.storage.cookie?.value ?? {}
                  )
                ),
                M(t.localStorageOptions),
                M(t.inMemoryStorageOptions),
                M(t.sessionStorageOptions)
              ),
                this.initClientDataStores(),
                (this.isInitialized = !0);
            }
            initClientDataStores() {
              this.initializeStorageState(),
                [Jt, zt, Qt, qt].forEach((e) => {
                  kr(e)?.isEnabled &&
                    this.setStore({
                      id: rr[e],
                      name: rr[e],
                      isEncrypted: !0,
                      noCompoundKey: !0,
                      type: e,
                    });
                });
            }
            initializeStorageState() {
              let e = wt.storage.type.value,
                t = wt.loadOptions.value.storage?.entries;
              const r = wt.consents.postConsent.value.storage;
              (A(r?.type) || A(r?.entries)) &&
                ((e = r?.type), (t = r?.entries));
              let n = !0,
                i = {};
              tr.forEach((r) => {
                const s = r,
                  o = r,
                  a = t?.[s]?.type,
                  l = ((e, t) => {
                    let r;
                    if (e.consents.preConsent.value.enabled)
                      switch (e.consents.preConsent.value.storage?.strategy) {
                        case "none":
                          r = Wt;
                          break;
                        case "session":
                          "sessionInfo" !== t && (r = Wt);
                          break;
                        case "anonymousId":
                          "anonymousId" !== t && (r = Wt);
                      }
                    return r;
                  })(wt, r),
                  u = l ?? a ?? e ?? Fe,
                  c = this.getResolvedStorageTypeForEntry(u, r);
                c !== Wt && (n = !1),
                  (i = { ...i, [r]: { type: c, key: Xt[o] } });
              }),
                me(() => {
                  (wt.storage.type.value = e),
                    (wt.storage.entries.value = i),
                    (wt.storage.trulyAnonymousTracking.value = n);
                });
            }
            getResolvedStorageTypeForEntry(e, t) {
              let r = e;
              switch (e) {
                case zt:
                  kr(zt)?.isEnabled || (r = Jt);
                  break;
                case qt:
                  kr(qt)?.isEnabled || (r = Jt);
                  break;
                case Jt:
                case Wt:
                  break;
                default:
                  r = kr(Qt)?.isEnabled
                    ? Qt
                    : kr(zt)?.isEnabled
                    ? zt
                    : kr(qt)?.isEnabled
                    ? qt
                    : Jt;
              }
              return (
                r !== e &&
                  this.logger?.warn(
                    ((e, t, r, n) =>
                      `${e}${ce}The storage type "${r}" is not available for entry "${t}". The SDK will initialize the entry with "${n}" storage type instead.`)(
                      J,
                      t,
                      e,
                      r
                    )
                  ),
                r
              );
            }
            setStore(e) {
              const t = kr(e.type);
              return (
                (this.stores[e.id] = new _r(e, t, this.pluginsManager)),
                this.stores[e.id]
              );
            }
            getStore(e) {
              return this.stores[e];
            }
            onError(e) {
              if (!this.hasErrorHandler) throw e;
              this.errorHandler?.onError(e, J);
            }
          }
          const Er = (e) => {
              if (!_(e)) return !1;
              try {
                return k(globalThis.URL) && new URL(e), ze.test(e);
              } catch (e) {
                return !1;
              }
            },
            wr = (e) =>
              e?.endsWith("/") ? wr(e.substring(0, e.length - 1)) : e,
            Ar = (e) => {
              try {
                return new URL(e).host;
              } catch (e) {
                return null;
              }
            },
            Ir = (e) => Ar(e) ?? "",
            xr = (e) => {
              const t = {};
              try {
                const r = new URL(e),
                  n = "utm_";
                r.searchParams.forEach((e, r) => {
                  if (r.startsWith(n)) {
                    let i = r.substring(n.length);
                    "campaign" === i && (i = "name"), (t[i] = e);
                  }
                });
              } catch (e) {}
              return t;
            },
            Tr = "none",
            Pr = "immediate",
            Cr = { All: !0 },
            Or = (e) => B(e) || Array.isArray(e),
            Rr = (e, t) => {
              let r,
                n,
                i = [],
                s = [],
                o = !1,
                a = !0 === e?.enabled;
              B(e) &&
                a &&
                (({ provider: n, consentManagerPluginName: r } = ((e, t) => {
                  let { provider: r } = e;
                  const n = r ? nt[r] : void 0;
                  var i;
                  return (
                    r &&
                      !n &&
                      (t?.error(
                        ((i = nt),
                        `${H}${ce}The consent manager "${r}" is not supported. Please choose one of the following supported consent managers: "${Object.keys(
                          i
                        )}".`)
                      ),
                      (r = void 0)),
                    { provider: r, consentManagerPluginName: n }
                  );
                })(e, t)),
                Or(e.allowedConsentIds) &&
                  ((i = e.allowedConsentIds), (o = !0)),
                Or(e.deniedConsentIds) && ((s = e.deniedConsentIds), (o = !0)));
              const l = { allowedConsentIds: i, deniedConsentIds: s };
              return (
                (a = a && Boolean(r)),
                {
                  provider: n,
                  consentManagerPluginName: r,
                  initialized: o,
                  enabled: a,
                  consentsData: l,
                }
              );
            },
            Br = (e) => {
              const {
                useServerSideCookies: t,
                dataServiceEndpoint: r,
                storage: n,
              } = wt.loadOptions.value;
              let i = n?.type;
              A(i) &&
                !((e) => "string" == typeof e && Ne.includes(e))(i) &&
                (e?.warn(
                  ((e, t, r) =>
                    `${e}${ce}The storage type "${t}" is not supported. Please choose one of the following supported types: "${Ne}". The default type "${r}" will be used instead.`)(
                    H,
                    i,
                    Fe
                  )
                ),
                (i = Fe));
              let s = n?.encryption?.version;
              const o = s && st[s];
              var a, l;
              !E(s) && E(o)
                ? (e?.warn(
                    ((a = st),
                    (l = tt),
                    `${H}${ce}The storage encryption version "${s}" is not supported. Please choose one of the following supported versions: "${Object.keys(
                      a
                    )}". The default version "${l}" will be used instead.`)
                  ),
                  (s = tt))
                : E(s) && (s = tt);
              const u = n?.migrate,
                c = u && s === tt;
              !0 === u &&
                c !== u &&
                e?.warn(
                  ((e, t, r) =>
                    `${e}${ce}The storage data migration has been disabled because the configured storage encryption version (${t}) is not the latest (${r}). To enable storage data migration, please update the storage encryption version to the latest version.`)(
                    H,
                    s,
                    tt
                  )
                ),
                me(() => {
                  wt.storage.type.value = i;
                  let e = n?.cookie ?? {};
                  if (t) {
                    wt.serverCookies.isEnabledServerSideCookies.value = t;
                    const n =
                      ((o = r ?? "rsaRequest"),
                      `${((e) => {
                        const t = new URL(e),
                          { host: r, protocol: n } = t,
                          i = r.split(".");
                        let s;
                        return (
                          (s =
                            i.length > 2
                              ? `${i[i.length - 2]}.${i[i.length - 1]}`
                              : r),
                          `${n}//${s}`
                        );
                      })(window.location.href)}/${
                        o.startsWith("/") ? o.substring(1) : o
                      }`);
                    Er(n)
                      ? ((wt.serverCookies.dataServiceUrl.value = wr(n)),
                        Ar(window.location.href) !== Ar(n) &&
                          (e = { ...e, samesite: "None", secure: !0 }))
                      : (wt.serverCookies.isEnabledServerSideCookies.value =
                          !1);
                  }
                  var o;
                  (wt.storage.cookie.value = e),
                    (wt.storage.encryptionPluginName.value = st[s]),
                    (wt.storage.migrate.value = c);
                });
            },
            Mr = (e, t, r, n, i, s) => {
              let o = "";
              if (s) {
                if (!Er(s))
                  throw new Error(
                    `Failed to load the SDK as the base URL for ${e} is not valid.`
                  );
                return wr(s);
              }
              const a = (() => {
                const e = document.getElementsByTagName("script"),
                  t = /(?:^|\/)rsa(\.min)?\.js$/;
                for (const r of e) {
                  const e = r.getAttribute("src");
                  if (e && t.test(e)) return e;
                }
              })();
              return (
                (o = a ? a.split("/").slice(0, -1).concat(t).join("/") : r),
                i && (o = o.replace(`/${We}/${qe}/${t}`, `/${n}/${qe}/${t}`)),
                o
              );
            };
          class $r {
            hasErrorHandler = !1;
            constructor(e, t, r) {
              (this.errorHandler = t),
                (this.logger = r),
                (this.httpClient = e),
                (this.hasErrorHandler = Boolean(this.errorHandler)),
                (this.onError = this.onError.bind(this)),
                (this.processConfig = this.processConfig.bind(this));
            }
            attachEffects() {
              $e(() => {
                this.logger?.setMinLogLevel(wt.lifecycle.logLevel.value);
              });
            }
            init() {
              var e, t;
              this.attachEffects(),
                (e = wt.lifecycle.writeKey.value),
                (t = wt.lifecycle.dataPlaneUrl.value),
                ((e) => {
                  if (!_(e) || 0 === e.trim().length)
                    throw new Error(
                      ((e) =>
                        `The write key "${e}" is invalid. It must be a non-empty string. Please check that the write key is correct and try again.`)(
                        e
                      )
                    );
                })(e),
                ((e) => {
                  if (!Er(e))
                    throw new Error(
                      ((e) =>
                        `The data plane URL "${e}" is invalid. It must be a valid URL string. Please check that the data plane URL is correct and try again.`)(
                        e
                      )
                    );
                })(t);
              const {
                logLevel: r,
                configUrl: n,
                lockIntegrationsVersion: i,
                lockPluginsVersion: s,
                destSDKBaseURL: o,
                pluginsSDKBaseURL: a,
              } = wt.loadOptions.value;
              wt.lifecycle.activeDataplaneUrl.value = wr(
                wt.lifecycle.dataPlaneUrl.value
              );
              const l = ((e, t, r) => Mr("integrations", Ge, Xe, e, t, r))(
                  Y,
                  i,
                  o
                ),
                u = ((e, t, r) => Mr("plugins", Qe, Ze, e, t, r))(Y, s, a);
              Br(this.logger),
                ((e) => {
                  const {
                      provider: t,
                      consentManagerPluginName: r,
                      initialized: n,
                      enabled: i,
                      consentsData: s,
                    } = Rr(wt.loadOptions.value.consentManagement, e),
                    o = wt.loadOptions.value.preConsent;
                  let a = o?.storage?.strategy ?? Tr;
                  var l, u;
                  A(a) &&
                    !["none", "session", "anonymousId"].includes(a) &&
                    ((a = Tr),
                    e?.warn(
                      ((l = H),
                      (u = o?.storage?.strategy),
                      `${l}${ce}The pre-consent storage strategy "${u}" is not supported. Please choose one of the following supported strategies: "none, session, anonymousId". The default strategy "${Tr}" will be used instead.`)
                    ));
                  let c = o?.events?.delivery ?? Pr;
                  A(c) &&
                    !["immediate", "buffer"].includes(c) &&
                    ((c = Pr),
                    e?.warn(
                      ((e, t, r) =>
                        `${e}${ce}The pre-consent events delivery type "${t}" is not supported. Please choose one of the following supported types: "immediate, buffer". The default type "${r}" will be used instead.`)(
                        H,
                        o?.events?.delivery,
                        Pr
                      )
                    )),
                    me(() => {
                      (wt.consents.activeConsentManagerPluginName.value = r),
                        (wt.consents.initialized.value = n),
                        (wt.consents.enabled.value = i),
                        (wt.consents.data.value = s),
                        (wt.consents.provider.value = t),
                        (wt.consents.preConsent.value = {
                          enabled:
                            !0 === wt.loadOptions.value.preConsent?.enabled &&
                            !1 === n &&
                            !0 === i,
                          storage: { strategy: a },
                          events: { delivery: c },
                        });
                    });
                })(this.logger),
                ((e) => {
                  if (wt.dataPlaneEvents.deliveryEnabled.value) {
                    const t = "XhrQueue";
                    let r = t;
                    wt.loadOptions.value.useBeacon &&
                      (wt.capabilities.isBeaconAvailable.value
                        ? (r = "BeaconQueue")
                        : ((r = t),
                          e?.warn(
                            `${H}${ce}The Beacon API is not supported by your browser. The events will be sent using XHR instead.`
                          ))),
                      me(() => {
                        wt.dataPlaneEvents.eventsQueuePluginName.value = r;
                      });
                  }
                })(this.logger),
                me(() => {
                  (wt.lifecycle.integrationsCDNPath.value = l),
                    (wt.lifecycle.pluginsCDNPath.value = u),
                    r && (wt.lifecycle.logLevel.value = r),
                    (wt.lifecycle.sourceConfigUrl.value = ((e, t, r, n, i) => {
                      const s = new URLSearchParams({
                        p: "npm",
                        v: Y,
                        build: qe,
                        writeKey: t,
                        lockIntegrationsVersion: r.toString(),
                        lockPluginsVersion: n.toString(),
                      });
                      let o = Ye,
                        a = s,
                        l = "/sourceConfig/",
                        u = "";
                      if (Er(e)) {
                        const t = new URL(e);
                        wr(t.pathname).endsWith("/sourceConfig") ||
                          (t.pathname = `${wr(t.pathname)}/sourceConfig/`),
                          (t.pathname = t.pathname.replace(/\/{2,}/g, "/")),
                          s.forEach((e, r) => {
                            null === t.searchParams.get(r) &&
                              t.searchParams.set(r, e);
                          }),
                          (o = t.origin),
                          (l = t.pathname),
                          (a = t.searchParams),
                          (u = t.hash);
                      } else
                        i?.warn(
                          ((e, t) =>
                            `${e}${ce}The provided source config URL "${t}" is invalid. Using the default source config URL instead.`)(
                            H,
                            e
                          )
                        );
                      return `${o}${l}?${a}${u}`;
                    })(n, wt.lifecycle.writeKey.value, i, s, this.logger));
                }),
                this.getConfig();
            }
            onError(e, t, r) {
              if (!this.hasErrorHandler) throw e;
              this.errorHandler?.onError(e, H, t, r);
            }
            processConfig(e, t) {
              if (!e)
                return void this.onError(
                  ((r = t?.error),
                  `Failed to fetch the source config. Reason: ${r}`)
                );
              var r;
              let n;
              try {
                n = _(e) ? JSON.parse(e) : e;
              } catch (e) {
                return void this.onError(e, Ve, !0);
              }
              if (
                !((e) =>
                  C(e) &&
                  C(e.source) &&
                  !w(e.source.id) &&
                  C(e.source.config) &&
                  Array.isArray(e.source.destinations))(n)
              )
                return void this.onError(new Error(Ve), void 0, !0);
              if (!1 === n.source.enabled)
                return void this.logger?.error(
                  "The source is disabled. Please enable the source in the dashboard to send events."
                );
              ((e, t) => {
                var r, n, i;
                if (
                  ((wt.reporting.isErrorReportingEnabled.value =
                    ((r = e.source.config),
                    !(
                      !0 !== r?.statsCollection?.errors?.enabled ||
                      (window.chrome &&
                        window.chrome.runtime &&
                        window.chrome.runtime.id)
                    ))),
                  (wt.reporting.isMetricsReportingEnabled.value = ((e) =>
                    !0 === e?.statsCollection?.metrics?.enabled)(
                    e.source.config
                  )),
                  wt.reporting.isErrorReportingEnabled.value)
                ) {
                  const r = ((e) => e?.statsCollection?.errors?.provider)(
                      e.source.config
                    ),
                    s = r ? it[r] : void 0;
                  E(r) ||
                    s ||
                    t?.warn(
                      ((n = it),
                      (i = et),
                      `${H}${ce}The error reporting provider "${r}" is not supported. Please choose one of the following supported providers: "${Object.keys(
                        n
                      )}". The default provider "${i}" will be used instead.`)
                    ),
                    (wt.reporting.errorReportingProviderPluginName.value =
                      s ?? it[et]);
                }
              })(n, this.logger);
              const i =
                n.source.destinations.length > 0
                  ? ((e) => {
                      const t = [];
                      return (
                        e.forEach((e) => {
                          e.enabled &&
                            !e.deleted &&
                            t.push({
                              id: e.id,
                              displayName: e.destinationDefinition.displayName,
                              config: e.config,
                              shouldApplyDeviceModeTransformation:
                                e.shouldApplyDeviceModeTransformation || !1,
                              propagateEventsUntransformedOnError:
                                e.propagateEventsUntransformedOnError || !1,
                              userFriendlyId: `${e.destinationDefinition.displayName.replaceAll(
                                " ",
                                "-"
                              )}___${e.id}`,
                            });
                        }),
                        t
                      );
                    })(n.source.destinations)
                  : [];
              me(() => {
                (wt.source.value = {
                  config: n.source.config,
                  id: n.source.id,
                  workspaceId: n.source.workspaceId,
                }),
                  (wt.nativeDestinations.configuredDestinations.value = i),
                  (wt.plugins.pluginsToLoadFromConfig.value =
                    wt.loadOptions.value.plugins ?? []),
                  ((e) => {
                    let t,
                      r = wt.consents.resolutionStrategy.value;
                    C(e.consentManagementMetadata) &&
                      (wt.consents.provider.value &&
                        (r =
                          e.consentManagementMetadata.providers.find(
                            (e) => e.provider === wt.consents.provider.value
                          )?.resolutionStrategy ??
                          wt.consents.resolutionStrategy.value),
                      (t = e.consentManagementMetadata)),
                      "custom" === wt.consents.provider.value && (r = void 0),
                      me(() => {
                        (wt.consents.metadata.value = g(t)),
                          (wt.consents.resolutionStrategy.value = r);
                      });
                  })(n),
                  (wt.lifecycle.status.value = "configured");
              });
            }
            getConfig() {
              const e = wt.loadOptions.value.getSourceConfig;
              if (e) {
                if (!k(e))
                  throw new Error(
                    '"getSourceConfig" must be a function. Please make sure that it is defined and returns a valid source configuration object.'
                  );
                const t = e();
                t instanceof Promise
                  ? t
                      .then((e) => this.processConfig(e))
                      .catch((e) => {
                        this.onError(e, "SourceConfig");
                      })
                  : this.processConfig(t);
              } else
                this.httpClient.getAsyncData({
                  url: wt.lifecycle.sourceConfigUrl.value,
                  options: { headers: { "Content-Type": void 0 } },
                  callback: this.processConfig,
                });
            }
          }
          const Dr = () => document?.referrer || "$direct",
            jr = () => {
              const e = (() => {
                const e = document.getElementsByTagName("link");
                let t = "";
                for (let r = 0; e[r]; r += 1) {
                  const n = e[r];
                  if ("canonical" === n.getAttribute("rel") && !t) {
                    t = n.getAttribute("href") ?? "";
                    break;
                  }
                }
                return t;
              })();
              let t = globalThis.location.pathname;
              const { href: r } = globalThis.location;
              let n = r;
              const { search: i } = globalThis.location;
              if (e)
                try {
                  const r = new URL(e);
                  (n = "" === r.search ? e + i : e), (t = r.pathname);
                } catch (e) {}
              const s = ((e) => {
                  let t = e;
                  try {
                    const r = new URL(e);
                    t = r.origin + r.pathname + r.search;
                  } catch (e) {}
                  return t;
                })(n),
                { title: o } = document,
                a = Dr();
              return {
                path: t,
                referrer: a,
                referring_domain: Ir(a),
                search: i,
                title: o,
                url: s,
                tab_url: r,
              };
            },
            Lr = `https://polyfill-fastly.io/v3/polyfill.min.js?version=3.111.0&features=${Object.keys(
              lr
            ).join("%2C")}`,
            Ur = "rudderstackPolyfill";
          class Nr {
            constructor(e, t) {
              (this.logger = t),
                (this.errorHandler = e),
                (this.externalSrcLoader = new pe(
                  this.errorHandler,
                  this.logger
                )),
                (this.onError = this.onError.bind(this)),
                (this.onReady = this.onReady.bind(this));
            }
            init() {
              try {
                this.prepareBrowserCapabilities(), this.attachWindowListeners();
              } catch (e) {
                this.onError(e);
              }
            }
            detectBrowserCapabilities() {
              me(() => {
                (wt.capabilities.storage.isCookieStorageAvailable.value = dr(
                  Qt,
                  kr(Qt),
                  this.logger
                )),
                  (wt.capabilities.storage.isLocalStorageAvailable.value = dr(
                    zt,
                    void 0,
                    this.logger
                  )),
                  (wt.capabilities.storage.isSessionStorageAvailable.value = dr(
                    qt,
                    void 0,
                    this.logger
                  )),
                  (wt.capabilities.isBeaconAvailable.value =
                    !w(globalThis.navigator.sendBeacon) &&
                    k(globalThis.navigator.sendBeacon)),
                  (wt.capabilities.isUaCHAvailable.value = ar()),
                  (wt.capabilities.isCryptoAvailable.value =
                    !w(globalThis.crypto) &&
                    k(globalThis.crypto.getRandomValues)),
                  (wt.capabilities.isIE11.value = Boolean(
                    globalThis.navigator.userAgent.match(/Trident.*rv:11\./)
                  )),
                  (wt.capabilities.isOnline.value =
                    globalThis.navigator.onLine),
                  (wt.context.userAgent.value = (() => {
                    if (E(globalThis.navigator)) return null;
                    let { userAgent: e } = globalThis.navigator;
                    const { brave: t } = globalThis.navigator;
                    if (t && Object.getPrototypeOf(t).isBrave) {
                      const t = e.match(/(chrome)\/([\w.]+)/i);
                      t && (e = `${e} Brave/${t[2]}`);
                    }
                    return e;
                  })()),
                  (wt.context.locale.value = E(globalThis.navigator)
                    ? null
                    : globalThis.navigator.language ??
                      globalThis.navigator.browserLanguage),
                  (wt.context.screen.value = ur()),
                  (wt.context.timezone.value = (() => {
                    const e = new Date().toString().match(/([A-Z]+[+-]\d+)/);
                    return e && e[1] ? e[1] : "NA";
                  })()),
                  ar() &&
                    ((e, t = "none") => {
                      "none" === t && e(void 0),
                        "default" === t && e(navigator.userAgentData),
                        "full" === t &&
                          navigator.userAgentData
                            ?.getHighEntropyValues([
                              "architecture",
                              "bitness",
                              "brands",
                              "mobile",
                              "model",
                              "platform",
                              "platformVersion",
                              "uaFullVersion",
                              "fullVersionList",
                              "wow64",
                            ])
                            .then((t) => {
                              e(t);
                            })
                            .catch(() => {
                              e();
                            });
                    })((e) => {
                      wt.context["ua-ch"].value = e;
                    }, wt.loadOptions.value.uaChTrackLevel);
              }),
                $e(() => {
                  !0 === wt.loadOptions.value.sendAdblockPage &&
                    void 0 !== wt.lifecycle.sourceConfigUrl.value &&
                    ((e, t) => {
                      const r = new URL(wt.lifecycle.sourceConfigUrl.value),
                        n = `${r.origin}${r.pathname}?view=ad`,
                        i = new Kt(e, t);
                      i.setAuthHeader(wt.lifecycle.writeKey.value),
                        i.getAsyncData({
                          url: n,
                          options: {
                            method: "HEAD",
                            headers: { "Content-Type": void 0 },
                          },
                          isRawResponse: !0,
                          callback: (e, t) => {
                            wt.capabilities.isAdBlocked.value =
                              void 0 !== t?.error || t?.xhr?.responseURL !== n;
                          },
                        });
                    })(this.errorHandler, this.logger);
                });
            }
            prepareBrowserCapabilities() {
              wt.capabilities.isLegacyDOM.value = (() => {
                const e = Object.keys(lr);
                let t = !1;
                for (let r = 0; r < e.length; r++) {
                  const n = lr[e[r]];
                  if (k(n) && n()) {
                    t = !0;
                    break;
                  }
                }
                return t;
              })();
              const e = wt.loadOptions.value.polyfillURL;
              let t = Lr;
              if (
                (I(e) &&
                  (Er(e)
                    ? (t = e)
                    : this.logger?.warn(
                        ((e, t) =>
                          `${e}${ce}The provided polyfill URL "${t}" is invalid. The default polyfill URL will be used instead.`)(
                          V,
                          e
                        )
                      )),
                wt.loadOptions.value.polyfillIfRequired &&
                  wt.capabilities.isLegacyDOM.value &&
                  Er(t))
              ) {
                const e = t !== wt.loadOptions.value.polyfillURL;
                if (e) {
                  const e = `RS_polyfillCallback_${wt.lifecycle.writeKey.value}`,
                    r = () => {
                      this.onReady(), delete globalThis[e];
                    };
                  (globalThis[e] = r), (t = `${t}&callback=${e}`);
                }
                this.externalSrcLoader.loadJSFile({
                  url: t,
                  id: Ur,
                  async: !0,
                  timeout: 1e4,
                  callback: (r) => {
                    r
                      ? e || this.onReady()
                      : this.onError(
                          new Error(
                            ((e, t) =>
                              `Failed to load the polyfill script with ID "${e}" from URL ${t}.`)(
                              Ur,
                              t
                            )
                          )
                        );
                  },
                });
              } else this.onReady();
            }
            attachWindowListeners() {
              globalThis.addEventListener("offline", () => {
                wt.capabilities.isOnline.value = !1;
              }),
                globalThis.addEventListener("online", () => {
                  wt.capabilities.isOnline.value = !0;
                }),
                globalThis.addEventListener(
                  "resize",
                  (function (e, t, r = 250) {
                    let n;
                    return (...i) => {
                      globalThis.clearTimeout(n),
                        (n = globalThis.setTimeout(() => {
                          e.apply(t, i);
                        }, r));
                    };
                  })(() => {
                    wt.context.screen.value = ur();
                  }, this)
                );
            }
            onReady() {
              this.detectBrowserCapabilities(),
                (wt.lifecycle.status.value = "browserCapabilitiesReady");
            }
            onError(e) {
              if (!this.errorHandler) throw e;
              this.errorHandler.onError(e, V);
            }
          }
          for (var Fr, Vr = [], Hr = 0; Hr < 256; Hr++)
            Vr[Hr] = (Hr + 256).toString(16).substring(1);
          for (var Kr, Gr = 256, Qr = []; Gr--; )
            Qr[Gr] = (Gr + 256).toString(16).substring(1);
          const zr = () =>
              !w(globalThis.crypto) && k(globalThis.crypto.getRandomValues)
                ? (function () {
                    (!Fr || Hr + 16 > 4096) &&
                      ((Fr = crypto.getRandomValues(new Uint8Array(4096))),
                      (Hr = 0));
                    for (var e, t = 0, r = ""; t < 16; t++)
                      (e = Fr[Hr + t]),
                        (r +=
                          6 == t
                            ? Vr[(15 & e) | 64]
                            : 8 == t
                            ? Vr[(63 & e) | 128]
                            : Vr[e]),
                        1 & t && t > 1 && t < 11 && (r += "-");
                    return (Hr += 16), r;
                  })()
                : (function () {
                    var e,
                      t = 0,
                      r = "";
                    if (!Kr || Gr + 16 > 256) {
                      for (Kr = Array((t = 256)); t--; )
                        Kr[t] = (256 * Math.random()) | 0;
                      t = Gr = 0;
                    }
                    for (; t < 16; t++)
                      (e = Kr[Gr + t]),
                        (r +=
                          6 == t
                            ? Qr[(15 & e) | 64]
                            : 8 == t
                            ? Qr[(63 & e) | 128]
                            : Qr[e]),
                        1 & t && t > 1 && t < 11 && (r += "-");
                    return Gr++, r;
                  })(),
            qr = ["integrations", "anonymousId", "originalTimestamp"],
            Jr = [
              "library",
              "consentManagement",
              "userAgent",
              "ua-ch",
              "screen",
            ],
            Wr = [
              "id",
              "anonymous_id",
              "user_id",
              "sent_at",
              "timestamp",
              "received_at",
              "original_timestamp",
              "event",
              "event_text",
              "channel",
              "context_ip",
              "context_request_ip",
              "context_passed_ip",
              "group_id",
              "previous_id",
            ],
            Xr = (e) => "number" == typeof e && !Number.isNaN(e),
            Zr = (e) => Xr(e) && e >= 0 && Number.isInteger(e),
            Yr = (e) => {
              const t = Date.now();
              return Boolean(!e || t > e);
            },
            en = (e, t) => {
              return (
                !!(e && Zr(e) && ((r = e), r.toString().length >= 10)) ||
                (t?.warn(
                  ((e, t, r) =>
                    `${e}${ce}The provided session ID (${t}) is either invalid, not a positive integer, or not at least "10" digits long. A new session ID will be auto-generated instead.`)(
                    Q,
                    e
                  )
                ),
                !1)
              );
              var r;
            },
            tn = (e) => Boolean(e === Qt || e === zt || e === qt || e === Jt),
            rn = () => zr(),
            nn = (e) => {
              const t = jr(),
                r = {};
              return (
                Object.keys(t).forEach((n) => {
                  r[n] = e?.[n] || t[n];
                }),
                (r.initial_referrer =
                  e?.initial_referrer || wt.session.initialReferrer.value),
                (r.initial_referring_domain =
                  e?.initial_referring_domain ||
                  wt.session.initialReferringDomain.value),
                r
              );
            },
            sn = (e, t, r) => {
              C(e) &&
                Object.keys(e).forEach((e) => {
                  (Wr.includes(e) || Wr.includes(e.toLowerCase())) &&
                    r?.warn(
                      ((e, t, r, n) =>
                        `${e}${ce}The "${t}" property defined under "${r}" is a reserved keyword. Please choose a different property name to avoid conflicts with reserved keywords (${n}).`)(
                        K,
                        e,
                        t,
                        Wr
                      )
                    );
                });
            },
            on = (e, t, r, n) => {
              const i = {
                channel: "web",
                context: {
                  traits: g(wt.session.userTraits.value),
                  sessionId: wt.session.sessionInfo.value.id || void 0,
                  sessionStart:
                    wt.session.sessionInfo.value.sessionStart || void 0,
                  ...(wt.consents.enabled.value && {
                    consentManagement: {
                      deniedConsentIds: g(
                        wt.consents.data.value.deniedConsentIds
                      ),
                      allowedConsentIds: g(
                        wt.consents.data.value.allowedConsentIds
                      ),
                      provider: wt.consents.provider.value,
                      resolutionStrategy: wt.consents.resolutionStrategy.value,
                    },
                  }),
                  "ua-ch": wt.context["ua-ch"].value,
                  app: wt.context.app.value,
                  library: wt.context.library.value,
                  userAgent: wt.context.userAgent.value,
                  os: wt.context.os.value,
                  locale: wt.context.locale.value,
                  screen: wt.context.screen.value,
                  campaign: xr(globalThis.location.href),
                  page: nn(r),
                  timezone: wt.context.timezone.value,
                },
                originalTimestamp: new Date().toISOString(),
                integrations: Cr,
                messageId: zr(),
                userId: e.userId || wt.session.userId.value,
              };
              tn(wt.storage.entries.value.anonymousId?.type)
                ? (i.anonymousId = wt.session.anonymousId.value)
                : (i.anonymousId = rn()),
                wt.storage.trulyAnonymousTracking.value &&
                  (i.context.trulyAnonymousTracking = !0),
                "identify" === e.type &&
                  (i.context.traits =
                    wt.storage.entries.value.userTraits?.type !== Wt
                      ? g(wt.session.userTraits.value)
                      : e.context.traits),
                "group" === e.type &&
                  ((e.groupId || wt.session.groupId.value) &&
                    (i.groupId = e.groupId || wt.session.groupId.value),
                  (e.traits || wt.session.groupTraits.value) &&
                    (i.traits =
                      wt.storage.entries.value.groupTraits?.type !== Wt
                        ? g(wt.session.groupTraits.value)
                        : e.traits));
              const s = R(e, i);
              return (
                void 0 === s.event && (s.event = null),
                void 0 === s.properties && (s.properties = null),
                ((e, t) => {
                  C(t) &&
                    (((e, t) => {
                      t.anonymousId &&
                        _(t.anonymousId) &&
                        (e.anonymousId = t.anonymousId),
                        C(t.integrations) && (e.integrations = t.integrations),
                        t.originalTimestamp &&
                          _(t.originalTimestamp) &&
                          (e.originalTimestamp = t.originalTimestamp);
                    })(e, t),
                    (e.context = ((e, t, r) => {
                      let n = e;
                      return (
                        Object.keys(t).forEach((e) => {
                          if (!qr.includes(e) && !Jr.includes(e))
                            if ("context" !== e) n = R(n, { [e]: t[e] });
                            else if (!E(t[e]) && C(t[e])) {
                              const r = {};
                              Object.keys(t[e]).forEach((n) => {
                                Jr.includes(n) || (r[n] = t[e][n]);
                              }),
                                (n = R(n, { ...r }));
                            }
                        }),
                        n
                      );
                    })(e.context, t)));
                })(s, t),
                ((e, t) => {
                  const { properties: r, traits: n, context: i } = e,
                    { traits: s } = i;
                  sn(r, "properties", t),
                    sn(n, "traits", t),
                    sn(s, "context.traits", t);
                })(s, n),
                (s.integrations = ((e) => {
                  let t;
                  return (
                    (t =
                      wt.loadOptions.value
                        .useGlobalIntegrationsConfigInEvents &&
                      (C(wt.consents.postConsent.value?.integrations) ||
                        C(wt.nativeDestinations.loadOnlyIntegrations.value))
                        ? g(
                            wt.consents.postConsent.value?.integrations ??
                              wt.nativeDestinations.loadOnlyIntegrations.value
                          )
                        : C(e)
                        ? e
                        : Cr),
                    t
                  );
                })(s.integrations)),
                s
              );
            };
          class an {
            constructor(e) {
              this.logger = e;
            }
            generatePageEvent(e, t, r, n) {
              let i = r ?? {};
              return (
                (i.name = t),
                (i.category = e),
                (i = ((e, t) => {
                  const r = t?.page || {},
                    n = e,
                    i = jr();
                  return (
                    Object.keys(i).forEach((e) => {
                      E(n[e]) && (n[e] = r[e] || i[e]);
                    }),
                    E(n.initial_referrer) &&
                      (n.initial_referrer =
                        r.initial_referrer || wt.session.initialReferrer.value),
                    E(n.initial_referring_domain) &&
                      (n.initial_referring_domain =
                        r.initial_referring_domain ||
                        wt.session.initialReferringDomain.value),
                    n
                  );
                })(i, n)),
                on(
                  { properties: i, name: t, category: e, type: "page" },
                  n,
                  i,
                  this.logger
                )
              );
            }
            generateTrackEvent(e, t, r) {
              return on(
                { properties: t, event: e, type: "track" },
                r,
                void 0,
                this.logger
              );
            }
            generateIdentifyEvent(e, t, r) {
              return on(
                { userId: e, type: "identify", context: { traits: t } },
                r,
                void 0,
                this.logger
              );
            }
            generateAliasEvent(e, t, r) {
              const n = on(
                { previousId: t, type: "alias" },
                r,
                void 0,
                this.logger
              );
              return (n.userId = e ?? n.userId), n;
            }
            generateGroupEvent(e, t, r) {
              const n = { type: "group" };
              return (
                e && (n.groupId = e),
                t && (n.traits = t),
                on(n, r, void 0, this.logger)
              );
            }
            create(e) {
              let t;
              switch (e.type) {
                case "page":
                  t = this.generatePageEvent(
                    e.category,
                    e.name,
                    e.properties,
                    e.options
                  );
                  break;
                case "track":
                  t = this.generateTrackEvent(e.name, e.properties, e.options);
                  break;
                case "identify":
                  t = this.generateIdentifyEvent(e.userId, e.traits, e.options);
                  break;
                case "alias":
                  t = this.generateAliasEvent(e.to, e.from, e.options);
                  break;
                case "group":
                  t = this.generateGroupEvent(e.groupId, e.traits, e.options);
              }
              return t;
            }
          }
          class ln {
            constructor(e, t, r, n) {
              (this.eventRepository = e),
                (this.userSessionManager = t),
                (this.errorHandler = r),
                (this.logger = n),
                (this.eventFactory = new an(this.logger)),
                (this.onError = this.onError.bind(this));
            }
            init() {
              this.eventRepository.init();
            }
            resume() {
              this.eventRepository.resume();
            }
            addEvent(e) {
              this.userSessionManager.refreshSession();
              const t = this.eventFactory.create(e);
              t
                ? this.eventRepository.enqueue(t, e.callback)
                : this.onError(
                    new Error("Failed to generate the event object.")
                  );
            }
            onError(e, t, r) {
              if (!this.errorHandler) throw e;
              this.errorHandler.onError(e, K, t, r);
            }
          }
          class un {
            constructor(e, t, r, n, i) {
              (this.storeManager = n),
                (this.pluginsManager = r),
                (this.logger = t),
                (this.errorHandler = e),
                (this.httpClient = i),
                (this.onError = this.onError.bind(this)),
                (this.serverSideCookieDebounceFuncs = {});
            }
            init() {
              this.syncStorageDataToState(), this.registerEffects();
            }
            syncStorageDataToState() {
              this.migrateStorageIfNeeded(),
                this.migrateDataFromPreviousStorage(),
                this.setUserId(this.getUserId()),
                this.setUserTraits(this.getUserTraits()),
                this.setGroupId(this.getGroupId()),
                this.setGroupTraits(this.getGroupTraits());
              const {
                externalAnonymousIdCookieName: e,
                anonymousIdOptions: t,
              } = wt.loadOptions.value;
              let r;
              I(e) &&
                "string" == typeof e &&
                (r = this.getExternalAnonymousIdByCookieName(e)),
                this.setAnonymousId(r ?? this.getAnonymousId(t)),
                this.setAuthToken(this.getAuthToken()),
                this.setInitialReferrerInfo(),
                this.configureSessionTracking();
            }
            configureSessionTracking() {
              let e = this.getSessionInfo();
              if (this.isPersistenceEnabledForStorageEntry("sessionInfo")) {
                const t = this.getConfiguredSessionTrackingInfo(),
                  r = e ?? ut;
                e = {
                  ...r,
                  ...t,
                  autoTrack: t.autoTrack && !0 !== r.manualTrack,
                };
              }
              (wt.session.sessionInfo.value =
                this.isPersistenceEnabledForStorageEntry("sessionInfo")
                  ? e
                  : lt.sessionInfo),
                wt.session.sessionInfo.value.autoTrack &&
                  this.startOrRenewAutoTracking(wt.session.sessionInfo.value);
            }
            setInitialReferrerInfo() {
              const e = this.getInitialReferrer(),
                t = this.getInitialReferringDomain();
              if (e && t)
                this.setInitialReferrer(e), this.setInitialReferringDomain(t);
              else {
                const t = e || Dr();
                this.setInitialReferrer(t),
                  this.setInitialReferringDomain(Ir(t));
              }
            }
            isPersistenceEnabledForStorageEntry(e) {
              return tn(wt.storage.entries.value[e]?.type);
            }
            migrateDataFromPreviousStorage() {
              const e = wt.storage.entries.value,
                t = [Qt, zt, qt];
              Object.keys(e).forEach((r) => {
                const n = r,
                  i = e[n]?.type,
                  s = this.storeManager?.getStore(rr[i]);
                s &&
                  t.forEach((e) => {
                    const t = this.storeManager?.getStore(rr[e]);
                    if (t && e !== i) {
                      const e = t.get(Xt[n]);
                      ((e) => I(e) && "" !== e)(e) && s.set(Xt[n], e),
                        t.remove(Xt[n]);
                    }
                  });
              });
            }
            migrateStorageIfNeeded() {
              if (!wt.storage.migrate.value) return;
              const e = [];
              [Zt, Yt, er].forEach((t) => {
                const r = this.storeManager?.getStore(t);
                r && e.push(r);
              }),
                Object.keys(Xt).forEach((t) => {
                  const r = Xt[t];
                  e.forEach((e) => {
                    const t = this.pluginsManager?.invokeSingle(
                      "storage.migrate",
                      r,
                      e.engine,
                      this.errorHandler,
                      this.logger
                    );
                    w(t) || e.set(r, t);
                  });
                });
            }
            getConfiguredSessionTrackingInfo() {
              let e,
                t = !1 !== wt.loadOptions.value.sessions?.autoTrack;
              if (!t) return { autoTrack: t };
              const r = wt.loadOptions.value.sessions?.timeout;
              return (
                Zr(r)
                  ? (e = r)
                  : (this.logger?.warn(
                      ((e, t, r) =>
                        `${e}${ce}The session timeout value "${t}" is not a number. The default timeout of 1800000 ms will be used instead.`)(
                        Q,
                        r
                      )
                    ),
                    (e = se)),
                0 === e &&
                  (this.logger?.warn(
                    `${Q}${ce}The session timeout value is 0, which disables the automatic session tracking feature. If you want to enable session tracking, please provide a positive integer value for the timeout.`
                  ),
                  (t = !1)),
                e > 0 &&
                  e < 1e4 &&
                  this.logger?.warn(
                    ((e, t, r) =>
                      `${e}${ce}The session timeout value ${t} ms is less than the recommended minimum of 10000 ms. Please consider increasing the timeout value to ensure optimal performance and reliability.`)(
                      Q,
                      e
                    )
                  ),
                { timeout: e, autoTrack: t }
              );
            }
            onError(e, t) {
              if (!this.errorHandler) throw e;
              this.errorHandler.onError(e, Q, t);
            }
            getEncryptedCookieData(e, t) {
              const r = [];
              return (
                e.forEach((e) => {
                  const n = t?.encrypt(ge(e.value, !1, [], this.logger));
                  I(n) && r.push({ name: e.name, value: n });
                }),
                r
              );
            }
            makeRequestToSetCookie(e, t) {
              this.httpClient?.getAsyncData({
                url: wt.serverCookies.dataServiceUrl.value,
                options: {
                  method: "POST",
                  data: ge({
                    reqType: "setCookies",
                    workspaceId: wt.source.value?.workspaceId,
                    data: {
                      options: {
                        maxAge: wt.storage.cookie.value?.maxage,
                        path: wt.storage.cookie.value?.path,
                        domain: wt.storage.cookie.value?.domain,
                        sameSite: wt.storage.cookie.value?.samesite,
                        secure: wt.storage.cookie.value?.secure,
                        expires: wt.storage.cookie.value?.expires,
                      },
                      cookies: e,
                    },
                  }),
                  sendRawData: !0,
                  withCredentials: !0,
                },
                isRawResponse: !0,
                callback: t,
              });
            }
            setServerSideCookies(e, t, r) {
              try {
                const n = this.getEncryptedCookieData(e, r);
                n.length > 0 &&
                  this.makeRequestToSetCookie(n, (n, i) => {
                    var s;
                    200 === i?.xhr?.status
                      ? e.forEach((e) => {
                          const n = r?.get(e.name),
                            i = ge(e.value, !1, []);
                          ge(n, !1, []) !== i &&
                            (this.logger?.error(
                              `The server failed to set the ${e.name} cookie. As a fallback, the cookies will be set client side.`
                            ),
                            t && t(e.name, e.value));
                        })
                      : (this.logger?.error(
                          ((s = i?.xhr?.status),
                          `The server responded with status ${s} while setting the cookies. As a fallback, the cookies will be set client side.`)
                        ),
                        e.forEach((e) => {
                          t && t(e.name, e.value);
                        }));
                  });
              } catch (r) {
                this.onError(
                  r,
                  "Failed to set/remove cookies via server. As a fallback, the cookies will be managed client side."
                ),
                  e.forEach((e) => {
                    t && t(e.name, e.value);
                  });
              }
            }
            syncValueToStorage(e, t) {
              const r = wt.storage.entries.value,
                n = r[e]?.type;
              if (tn(n)) {
                const i = this.storeManager?.getStore(rr[n]),
                  s = r[e]?.key;
                t && (_(t) || B(t))
                  ? wt.serverCookies.isEnabledServerSideCookies.value &&
                    n === Qt
                    ? (this.serverSideCookieDebounceFuncs[e] &&
                        globalThis.clearTimeout(
                          this.serverSideCookieDebounceFuncs[e]
                        ),
                      (this.serverSideCookieDebounceFuncs[e] =
                        globalThis.setTimeout(() => {
                          this.setServerSideCookies(
                            [{ name: s, value: t }],
                            (e, t) => {
                              i?.set(e, t);
                            },
                            i
                          );
                        }, 10)))
                    : i?.set(s, t)
                  : i?.remove(s);
              }
            }
            registerEffects() {
              tr.forEach((e) => {
                $e(() => {
                  this.syncValueToStorage(e, wt.session[e].value);
                });
              });
            }
            setAnonymousId(e, t) {
              let r = e;
              if (this.isPersistenceEnabledForStorageEntry("anonymousId")) {
                if (!r && t) {
                  const e = this.pluginsManager?.invokeSingle(
                    "userSession.anonymousIdGoogleLinker",
                    t
                  );
                  r = e;
                }
                r = r || rn();
              } else r = lt.anonymousId;
              wt.session.anonymousId.value = r;
            }
            getAnonymousId(e) {
              const t = wt.storage.entries.value.anonymousId?.type;
              if (tn(t)) {
                let t = this.getEntryValue("anonymousId");
                if (!t && e) {
                  const r = this.pluginsManager?.invokeSingle(
                    "storage.getAnonymousId",
                    kr,
                    e
                  );
                  t = r;
                }
                wt.session.anonymousId.value = t || rn();
              }
              return wt.session.anonymousId.value;
            }
            getEntryValue(e) {
              const t = wt.storage.entries.value,
                r = t[e]?.type;
              if (tn(r)) {
                const n = this.storeManager?.getStore(rr[r]),
                  i = t[e]?.key;
                return n?.get(i) ?? null;
              }
              return null;
            }
            getExternalAnonymousIdByCookieName(e) {
              const t = kr(Qt);
              return t?.isEnabled ? t.getItem(e) ?? null : null;
            }
            getUserId() {
              return this.getEntryValue("userId");
            }
            getUserTraits() {
              return this.getEntryValue("userTraits");
            }
            getGroupId() {
              return this.getEntryValue("groupId");
            }
            getGroupTraits() {
              return this.getEntryValue("groupTraits");
            }
            getInitialReferrer() {
              return this.getEntryValue("initialReferrer");
            }
            getInitialReferringDomain() {
              return this.getEntryValue("initialReferringDomain");
            }
            getSessionInfo() {
              return this.getEntryValue("sessionInfo");
            }
            getAuthToken() {
              return this.getEntryValue("authToken");
            }
            getSessionId() {
              const e = this.getSessionInfo() ?? lt.sessionInfo;
              return (e.autoTrack && !Yr(e.expiresAt)) || e.manualTrack
                ? e.id ?? null
                : null;
            }
            refreshSession() {
              let e = this.getSessionInfo() ?? lt.sessionInfo;
              (e.autoTrack || e.manualTrack) &&
                (e.autoTrack &&
                  (this.startOrRenewAutoTracking(e),
                  (e = wt.session.sessionInfo.value)),
                void 0 === e.sessionStart
                  ? (e = { ...e, sessionStart: !0 })
                  : e.sessionStart && (e = { ...e, sessionStart: !1 })),
                (wt.session.sessionInfo.value = e),
                "readyExecuted" !== wt.lifecycle.status.value &&
                  this.syncValueToStorage("sessionInfo", e);
            }
            reset(e, t) {
              const { session: r } = wt,
                { manualTrack: n, autoTrack: i } = r.sessionInfo.value;
              me(() => {
                (r.userId.value = lt.userId),
                  (r.userTraits.value = lt.userTraits),
                  (r.groupId.value = lt.groupId),
                  (r.groupTraits.value = lt.groupTraits),
                  (r.authToken.value = lt.authToken),
                  e && this.setAnonymousId(),
                  t ||
                    (i
                      ? ((r.sessionInfo.value = lt.sessionInfo),
                        this.startOrRenewAutoTracking(r.sessionInfo.value))
                      : n && this.startManualTrackingInternal());
              });
            }
            setUserId(e) {
              wt.session.userId.value =
                this.isPersistenceEnabledForStorageEntry("userId") && e
                  ? e
                  : lt.userId;
            }
            setUserTraits(e) {
              wt.session.userTraits.value =
                this.isPersistenceEnabledForStorageEntry("userTraits") && e
                  ? R(wt.session.userTraits.value ?? lt.userTraits, e)
                  : lt.userTraits;
            }
            setGroupId(e) {
              wt.session.groupId.value =
                this.isPersistenceEnabledForStorageEntry("groupId") && e
                  ? e
                  : lt.groupId;
            }
            setGroupTraits(e) {
              wt.session.groupTraits.value =
                this.isPersistenceEnabledForStorageEntry("groupTraits") && e
                  ? R(wt.session.groupTraits.value ?? lt.groupTraits, e)
                  : lt.groupTraits;
            }
            setInitialReferrer(e) {
              wt.session.initialReferrer.value =
                this.isPersistenceEnabledForStorageEntry("initialReferrer") && e
                  ? e
                  : lt.initialReferrer;
            }
            setInitialReferringDomain(e) {
              wt.session.initialReferringDomain.value =
                this.isPersistenceEnabledForStorageEntry(
                  "initialReferringDomain"
                ) && e
                  ? e
                  : lt.initialReferringDomain;
            }
            startOrRenewAutoTracking(e) {
              if (Yr(e.expiresAt))
                wt.session.sessionInfo.value = ((e) => {
                  const t = Date.now(),
                    r = e || se;
                  return {
                    id: t,
                    expiresAt: t + r,
                    timeout: r,
                    sessionStart: void 0,
                    autoTrack: !0,
                  };
                })(e.timeout);
              else {
                const t = Date.now(),
                  r = e.timeout;
                wt.session.sessionInfo.value = R(e, { expiresAt: t + r });
              }
            }
            start(e) {
              wt.session.sessionInfo.value = ((e, t) => ({
                id: en(e, t) ? e : Date.now(),
                sessionStart: void 0,
                manualTrack: !0,
              }))(e, this.logger);
            }
            startManualTrackingInternal() {
              this.start(Date.now());
            }
            end() {
              wt.session.sessionInfo.value = lt.sessionInfo;
            }
            setAuthToken(e) {
              wt.session.authToken.value =
                this.isPersistenceEnabledForStorageEntry("authToken") && e
                  ? e
                  : lt.authToken;
            }
          }
          const cn = [
              "BeaconQueue",
              "Bugsnag",
              "CustomConsentManager",
              "DeviceModeDestinations",
              "DeviceModeTransformation",
              "ErrorReporting",
              "ExternalAnonymousId",
              "GoogleLinker",
              "KetchConsentManager",
              "NativeDestinationQueue",
              "OneTrustConsentManager",
              "StorageEncryption",
              "StorageEncryptionLegacy",
              "StorageMigrator",
              "XhrQueue",
            ],
            dn = "dataplaneEventsQueue",
            hn = "destinationsEventsQueue";
          class gn {
            constructor(e, t, r, n) {
              (this.pluginsManager = e),
                (this.errorHandler = r),
                (this.logger = n),
                (this.httpClient = new Kt(r, n)),
                (this.storeManager = t),
                (this.onError = this.onError.bind(this));
            }
            init() {
              try {
                this.dataplaneEventsQueue = this.pluginsManager.invokeSingle(
                  `${dn}.init`,
                  wt,
                  this.httpClient,
                  this.storeManager,
                  this.errorHandler,
                  this.logger
                );
              } catch (e) {
                this.onError(e, "XhrQueuePlugin initialization failed");
              }
              try {
                this.dmtEventsQueue = this.pluginsManager.invokeSingle(
                  "transformEvent.init",
                  wt,
                  this.pluginsManager,
                  this.httpClient,
                  this.storeManager,
                  this.errorHandler,
                  this.logger
                );
              } catch (e) {
                this.onError(
                  e,
                  "DeviceModeTransformationPlugin initialization failed"
                );
              }
              try {
                this.destinationsEventsQueue = this.pluginsManager.invokeSingle(
                  `${hn}.init`,
                  wt,
                  this.pluginsManager,
                  this.storeManager,
                  this.dmtEventsQueue,
                  this.errorHandler,
                  this.logger
                );
              } catch (e) {
                this.onError(
                  e,
                  "NativeDestinationQueuePlugin initialization failed"
                );
              }
              $e(() => {
                !0 === wt.nativeDestinations.clientDestinationsReady.value &&
                  (this.destinationsEventsQueue?.start(),
                  this.dmtEventsQueue?.start());
              });
              const e = ((e) =>
                e.consents.preConsent.value.enabled &&
                "buffer" === e.consents.preConsent.value.events?.delivery &&
                ("session" === e.consents.preConsent.value.storage?.strategy ||
                  "none" === e.consents.preConsent.value.storage?.strategy))(
                wt
              );
              let t;
              $e(() => {
                const r =
                  !0 === wt.loadOptions.value.bufferDataPlaneEventsUntilReady &&
                  !1 === wt.nativeDestinations.clientDestinationsReady.value;
                (!1 !==
                  wt.nativeDestinations.activeDestinations.value.some((e) => {
                    return (
                      (t = e),
                      Boolean(
                        "hybrid" === t.config.connectionMode ||
                          !0 === t.config.useNativeSDKToSend
                      )
                    );
                    var t;
                  }) &&
                  !1 !== r) ||
                  e ||
                  !0 === this.dataplaneEventsQueue?.scheduleTimeoutActive ||
                  (globalThis.clearTimeout(t),
                  this.dataplaneEventsQueue?.start());
              }),
                !0 === wt.loadOptions.value.bufferDataPlaneEventsUntilReady &&
                  (t = globalThis.setTimeout(() => {
                    !0 !== this.dataplaneEventsQueue?.scheduleTimeoutActive &&
                      this.dataplaneEventsQueue?.start();
                  }, wt.loadOptions.value.dataPlaneEventsBufferTimeout));
            }
            resume() {
              !0 !== this.dataplaneEventsQueue?.scheduleTimeoutActive &&
                (wt.consents.postConsent.value.discardPreConsentEvents &&
                  (this.dataplaneEventsQueue?.clear(),
                  this.destinationsEventsQueue?.clear()),
                this.dataplaneEventsQueue?.start());
            }
            enqueue(e, t) {
              let r;
              try {
                (r = ((e, t) => {
                  const r = g(e),
                    n = e.integrations ?? Cr,
                    i = t.nativeDestinations.integrationsConfig.value,
                    s = ((e, t) =>
                      Object.keys(e)
                        .filter((r) => !0 !== e[r] || !t[r])
                        .reduce((t, r) => {
                          const n = g(t);
                          return (n[r] = e[r]), n;
                        }, {}))(n, i);
                  return (r.integrations = R(i, s)), r;
                })(e, wt)),
                  this.pluginsManager.invokeSingle(
                    `${dn}.enqueue`,
                    wt,
                    this.dataplaneEventsQueue,
                    r,
                    this.errorHandler,
                    this.logger
                  );
              } catch (e) {
                this.onError(e, "XhrQueuePlugin event enqueue failed");
              }
              try {
                const t = g(e);
                this.pluginsManager.invokeSingle(
                  `${hn}.enqueue`,
                  wt,
                  this.destinationsEventsQueue,
                  t,
                  this.errorHandler,
                  this.logger
                );
              } catch (e) {
                this.onError(
                  e,
                  "NativeDestinationQueuePlugin event enqueue failed"
                );
              }
              try {
                t?.(r);
              } catch (e) {
                this.onError(e, "API Callback Invocation Failed");
              }
            }
            onError(e, t, r) {
              if (!this.errorHandler) throw e;
              this.errorHandler.onError(e, "EventRepository", t, r);
            }
          }
          const fn = (e) => {
            const t = new CustomEvent(e, {
              detail: { analyticsInstance: globalThis.rudderanalytics },
              bubbles: !0,
              cancelable: !0,
              composed: !0,
            });
            globalThis.document.dispatchEvent(t);
          };
          class pn {
            constructor() {
              (this.preloadBuffer = new De()),
                (this.initialized = !1),
                (this.errorHandler = Tt),
                (this.logger = Ue),
                (this.externalSrcLoader = new pe(
                  this.errorHandler,
                  this.logger
                )),
                (this.capabilitiesManager = new Nr(
                  this.errorHandler,
                  this.logger
                )),
                (this.httpClient = Gt);
            }
            load(e, t, r = {}) {
              if (wt.lifecycle.status.value) return;
              let n = g(t),
                i = g(r);
              P(t) && ((i = t), (n = void 0)),
                me(() => {
                  (wt.lifecycle.writeKey.value = e),
                    (wt.lifecycle.dataPlaneUrl.value = n),
                    (wt.loadOptions.value = ((e, t) => {
                      const r = g(t);
                      return (
                        _(r.setCookieDomain) || delete r.setCookieDomain,
                        ["Strict", "Lax", "None"].includes(r.sameSiteCookie) ||
                          delete r.sameSiteCookie,
                        (r.secureCookie = !0 === r.secureCookie),
                        ["none", "default", "full"].includes(
                          r.uaChTrackLevel
                        ) || delete r.uaChTrackLevel,
                        C(r.integrations) || delete r.integrations,
                        (r.plugins = r.plugins ?? cn),
                        (r.useGlobalIntegrationsConfigInEvents =
                          !0 === r.useGlobalIntegrationsConfigInEvents),
                        (r.bufferDataPlaneEventsUntilReady =
                          !0 === r.bufferDataPlaneEventsUntilReady),
                        (r.sendAdblockPage = !0 === r.sendAdblockPage),
                        (r.useServerSideCookies =
                          !0 === r.useServerSideCookies),
                        r.dataServiceEndpoint &&
                          "string" != typeof r.dataServiceEndpoint &&
                          delete r.dataServiceEndpoint,
                        C(r.sendAdblockPageOptions) ||
                          delete r.sendAdblockPageOptions,
                        A(r.loadIntegration)
                          ? (r.loadIntegration = !0 === r.loadIntegration)
                          : delete r.loadIntegration,
                        C(r.storage)
                          ? ((r.storage = $(r.storage)),
                            (r.storage.migrate = !0 === r.storage?.migrate))
                          : delete r.storage,
                        C(r.beaconQueueOptions)
                          ? (r.beaconQueueOptions = $(r.beaconQueueOptions))
                          : delete r.beaconQueueOptions,
                        C(r.destinationsQueueOptions)
                          ? (r.destinationsQueueOptions = $(
                              r.destinationsQueueOptions
                            ))
                          : delete r.destinationsQueueOptions,
                        C(r.queueOptions)
                          ? (r.queueOptions = $(r.queueOptions))
                          : delete r.queueOptions,
                        (r.lockIntegrationsVersion =
                          !0 === r.lockIntegrationsVersion),
                        (r.lockPluginsVersion = !0 === r.lockPluginsVersion),
                        Xr(r.dataPlaneEventsBufferTimeout) ||
                          delete r.dataPlaneEventsBufferTimeout,
                        C(r.storage?.cookie)
                          ? (r.storage.cookie = $(r.storage?.cookie))
                          : delete r.storage?.cookie,
                        C(r.preConsent)
                          ? (r.preConsent = $(r.preConsent))
                          : delete r.preConsent,
                        R(e, r)
                      );
                    })(wt.loadOptions.value, i)),
                    (wt.lifecycle.status.value = "mounted");
                }),
                wt.loadOptions.value.logLevel &&
                  this.logger?.setMinLogLevel(wt.loadOptions.value.logLevel),
                ae("state", wt, e),
                this.startLifecycle();
            }
            startLifecycle() {
              $e(() => {
                try {
                  switch (wt.lifecycle.status.value) {
                    case "mounted":
                      this.onMounted();
                      break;
                    case "browserCapabilitiesReady":
                      this.onBrowserCapabilitiesReady();
                      break;
                    case "configured":
                      this.onConfigured();
                      break;
                    case "pluginsLoading":
                    case "destinationsLoading":
                    case "readyExecuted":
                    default:
                      break;
                    case "pluginsReady":
                      this.onPluginsReady();
                      break;
                    case "initialized":
                      this.onInitialized();
                      break;
                    case "loaded":
                      this.onLoaded();
                      break;
                    case "destinationsReady":
                      this.onDestinationsReady();
                      break;
                    case "ready":
                      this.onReady();
                  }
                } catch (e) {
                  const t = "Failed to load the SDK";
                  this.errorHandler.onError(fe(e, t), X);
                }
              });
            }
            onBrowserCapabilitiesReady() {
              ((e) => {
                const t =
                  ((e, t = "app") => (
                    oe(t), globalThis.RudderStackGlobals[t][e]
                  ))(te) || [];
                ((e = []) => {
                  const t = new URLSearchParams(globalThis.location.search);
                  t.get(ie) &&
                    e.unshift(["track", t.get(ie), le(t, "ajs_prop_")]),
                    t.get(ne) &&
                      e.unshift(["identify", t.get(ne), le(t, "ajs_trait_")]),
                    t.get(re) && e.unshift(["setAnonymousId", t.get(re)]);
                })(t),
                  t.length > 0 && (e.enqueuePreloadBufferEvents(t), ae(te, []));
              })(this),
                this.prepareInternalServices(),
                this.loadConfig();
            }
            onLoaded() {
              this.processBufferedEvents(),
                !0 === wt.consents.preConsent.value.enabled
                  ? (wt.lifecycle.status.value = "ready")
                  : this.loadDestinations();
            }
            onMounted() {
              this.capabilitiesManager.init();
            }
            enqueuePreloadBufferEvents(e) {
              Array.isArray(e) &&
                e.forEach((e) => this.preloadBuffer.enqueue(g(e)));
            }
            processDataInPreloadBuffer() {
              for (; this.preloadBuffer.size() > 0; ) {
                const e = this.preloadBuffer.dequeue();
                e && ue([...e], this);
              }
            }
            prepareInternalServices() {
              (this.pluginsManager = new Ut(
                At,
                this.errorHandler,
                this.logger
              )),
                (this.storeManager = new Sr(
                  this.pluginsManager,
                  this.errorHandler,
                  this.logger
                )),
                (this.configManager = new $r(
                  this.httpClient,
                  this.errorHandler,
                  this.logger
                )),
                (this.userSessionManager = new un(
                  this.errorHandler,
                  this.logger,
                  this.pluginsManager,
                  this.storeManager,
                  this.httpClient
                )),
                (this.eventRepository = new gn(
                  this.pluginsManager,
                  this.storeManager,
                  this.errorHandler,
                  this.logger
                )),
                (this.eventManager = new ln(
                  this.eventRepository,
                  this.userSessionManager,
                  this.errorHandler,
                  this.logger
                ));
            }
            loadConfig() {
              wt.lifecycle.writeKey.value &&
                this.httpClient.setAuthHeader(wt.lifecycle.writeKey.value),
                this.configManager?.init();
            }
            onPluginsReady() {
              this.errorHandler.init(this.externalSrcLoader),
                this.storeManager?.init(),
                this.userSessionManager?.init(),
                wt.consents.enabled.value &&
                  !wt.consents.initialized.value &&
                  (this.pluginsManager?.invokeSingle(
                    "consentManager.init",
                    wt,
                    this.logger
                  ),
                  !1 === wt.consents.preConsent.value.enabled &&
                    this.pluginsManager?.invokeSingle(
                      "consentManager.updateConsentsInfo",
                      wt,
                      this.storeManager,
                      this.logger
                    )),
                this.eventManager?.init(),
                (wt.lifecycle.status.value = "initialized");
            }
            onConfigured() {
              this.pluginsManager?.init();
            }
            onInitialized() {
              this.processDataInPreloadBuffer(),
                k(wt.loadOptions.value.onLoaded) &&
                  wt.loadOptions.value.onLoaded(globalThis.rudderanalytics),
                me(() => {
                  (wt.lifecycle.loaded.value = !0),
                    (wt.lifecycle.status.value = "loaded");
                }),
                (this.initialized = !0),
                fn("RSA_Initialised");
            }
            onReady() {
              (wt.lifecycle.status.value = "readyExecuted"),
                wt.eventBuffer.readyCallbacksArray.value.forEach((e) => {
                  try {
                    e();
                  } catch (e) {
                    this.errorHandler.onError(e, X, Ke);
                  }
                }),
                fn("RSA_Ready");
            }
            processBufferedEvents() {
              let e = wt.eventBuffer.toBeProcessedArray.value;
              for (; e.length > 0; ) {
                const t = e.shift();
                if (((wt.eventBuffer.toBeProcessedArray.value = e), t)) {
                  const e = t[0];
                  k(this[e]) && this[e](...t.slice(1), !0);
                }
                e = wt.eventBuffer.toBeProcessedArray.value;
              }
            }
            loadDestinations() {
              if (wt.nativeDestinations.clientDestinationsReady.value) return;
              this.pluginsManager?.invokeSingle(
                "nativeDestinations.setActiveDestinations",
                wt,
                this.pluginsManager,
                this.errorHandler,
                this.logger
              );
              const e = wt.nativeDestinations.activeDestinations.value.length;
              0 !== e
                ? ((wt.lifecycle.status.value = "destinationsLoading"),
                  this.pluginsManager?.invokeSingle(
                    "nativeDestinations.load",
                    wt,
                    this.externalSrcLoader,
                    this.errorHandler,
                    this.logger
                  ),
                  $e(() => {
                    (0 === e ||
                      wt.nativeDestinations.initializedDestinations.value
                        .length +
                        wt.nativeDestinations.failedDestinations.value
                          .length ===
                        e) &&
                      me(() => {
                        (wt.lifecycle.status.value = "destinationsReady"),
                          (wt.nativeDestinations.clientDestinationsReady.value =
                            !0);
                      });
                  }))
                : (wt.lifecycle.status.value = "destinationsReady");
            }
            onDestinationsReady() {
              "ready" !== wt.lifecycle.status.value &&
                (wt.lifecycle.status.value = "ready");
            }
            ready(e, t = !1) {
              const r = "ready";
              if (wt.lifecycle.loaded.value)
                if (
                  (this.errorHandler.leaveBreadcrumb(`New ${r} invocation`),
                  k(e))
                )
                  if ("readyExecuted" === wt.lifecycle.status.value)
                    try {
                      e();
                    } catch (e) {
                      this.errorHandler.onError(e, X, Ke);
                    }
                  else
                    wt.eventBuffer.readyCallbacksArray.value = [
                      ...wt.eventBuffer.readyCallbacksArray.value,
                      e,
                    ];
                else
                  this.logger.error(
                    `readyApi${ce}The callback is not a function.`
                  );
              else
                wt.eventBuffer.toBeProcessedArray.value = [
                  ...wt.eventBuffer.toBeProcessedArray.value,
                  [r, e],
                ];
            }
            page(e, t = !1) {
              const r = "page";
              wt.lifecycle.loaded.value
                ? (this.errorHandler.leaveBreadcrumb(`New ${r} event`),
                  (wt.metrics.triggered.value += 1),
                  this.eventManager?.addEvent({
                    type: "page",
                    category: e.category,
                    name: e.name,
                    properties: e.properties,
                    options: e.options,
                    callback: e.callback,
                  }),
                  !0 === wt.capabilities.isAdBlocked.value &&
                    e.category !== ee &&
                    this.page(
                      j(
                        ee,
                        "ad-block page request",
                        { path: "/ad-blocked" },
                        wt.loadOptions.value.sendAdblockPageOptions
                      )
                    ))
                : (wt.eventBuffer.toBeProcessedArray.value = [
                    ...wt.eventBuffer.toBeProcessedArray.value,
                    [r, e],
                  ]);
            }
            track(e, t = !1) {
              const r = "track";
              wt.lifecycle.loaded.value
                ? (this.errorHandler.leaveBreadcrumb(`New ${r} event`),
                  (wt.metrics.triggered.value += 1),
                  this.eventManager?.addEvent({
                    type: r,
                    name: e.name || void 0,
                    properties: e.properties,
                    options: e.options,
                    callback: e.callback,
                  }))
                : (wt.eventBuffer.toBeProcessedArray.value = [
                    ...wt.eventBuffer.toBeProcessedArray.value,
                    [r, e],
                  ]);
            }
            identify(e, t = !1) {
              const r = "identify";
              wt.lifecycle.loaded.value
                ? (this.errorHandler.leaveBreadcrumb(`New ${r} event`),
                  (wt.metrics.triggered.value += 1),
                  Boolean(
                    e.userId &&
                      wt.session.userId.value &&
                      e.userId !== wt.session.userId.value
                  ) && this.reset(),
                  S(e.userId) || this.userSessionManager?.setUserId(e.userId),
                  this.userSessionManager?.setUserTraits(e.traits),
                  this.eventManager?.addEvent({
                    type: r,
                    userId: e.userId,
                    traits: e.traits,
                    options: e.options,
                    callback: e.callback,
                  }))
                : (wt.eventBuffer.toBeProcessedArray.value = [
                    ...wt.eventBuffer.toBeProcessedArray.value,
                    [r, e],
                  ]);
            }
            alias(e, t = !1) {
              const r = "alias";
              if (!wt.lifecycle.loaded.value)
                return void (wt.eventBuffer.toBeProcessedArray.value = [
                  ...wt.eventBuffer.toBeProcessedArray.value,
                  [r, e],
                ]);
              this.errorHandler.leaveBreadcrumb(`New ${r} event`),
                (wt.metrics.triggered.value += 1);
              const n =
                e.from ??
                this.userSessionManager?.getUserId() ??
                this.userSessionManager?.getAnonymousId();
              this.eventManager?.addEvent({
                type: r,
                to: e.to,
                from: n,
                options: e.options,
                callback: e.callback,
              });
            }
            group(e, t = !1) {
              const r = "group";
              wt.lifecycle.loaded.value
                ? (this.errorHandler.leaveBreadcrumb(`New ${r} event`),
                  (wt.metrics.triggered.value += 1),
                  S(e.groupId) ||
                    this.userSessionManager?.setGroupId(e.groupId),
                  this.userSessionManager?.setGroupTraits(e.traits),
                  this.eventManager?.addEvent({
                    type: r,
                    groupId: e.groupId,
                    traits: e.traits,
                    options: e.options,
                    callback: e.callback,
                  }))
                : (wt.eventBuffer.toBeProcessedArray.value = [
                    ...wt.eventBuffer.toBeProcessedArray.value,
                    [r, e],
                  ]);
            }
            reset(e, t = !1) {
              const r = "reset";
              wt.lifecycle.loaded.value
                ? (this.errorHandler.leaveBreadcrumb(
                    `New ${r} invocation, resetAnonymousId: ${e}`
                  ),
                  this.userSessionManager?.reset(e))
                : (wt.eventBuffer.toBeProcessedArray.value = [
                    ...wt.eventBuffer.toBeProcessedArray.value,
                    [r, e],
                  ]);
            }
            getAnonymousId(e) {
              return this.userSessionManager?.getAnonymousId(e);
            }
            setAnonymousId(e, t, r = !1) {
              const n = "setAnonymousId";
              wt.lifecycle.loaded.value
                ? (this.errorHandler.leaveBreadcrumb(`New ${n} invocation`),
                  this.userSessionManager?.setAnonymousId(e, t))
                : (wt.eventBuffer.toBeProcessedArray.value = [
                    ...wt.eventBuffer.toBeProcessedArray.value,
                    [n, e, t],
                  ]);
            }
            getUserId() {
              return wt.session.userId.value;
            }
            getUserTraits() {
              return wt.session.userTraits.value;
            }
            getGroupId() {
              return wt.session.groupId.value;
            }
            getGroupTraits() {
              return wt.session.groupTraits.value;
            }
            startSession(e, t = !1) {
              const r = "startSession";
              wt.lifecycle.loaded.value
                ? (this.errorHandler.leaveBreadcrumb(`New ${r} invocation`),
                  this.userSessionManager?.start(e))
                : (wt.eventBuffer.toBeProcessedArray.value = [
                    ...wt.eventBuffer.toBeProcessedArray.value,
                    [r, e],
                  ]);
            }
            endSession(e = !1) {
              const t = "endSession";
              wt.lifecycle.loaded.value
                ? (this.errorHandler.leaveBreadcrumb(`New ${t} invocation`),
                  this.userSessionManager?.end())
                : (wt.eventBuffer.toBeProcessedArray.value = [
                    ...wt.eventBuffer.toBeProcessedArray.value,
                    [t],
                  ]);
            }
            getSessionId() {
              const e = this.userSessionManager?.getSessionId();
              return e ?? null;
            }
            consent(e, t = !1) {
              wt.lifecycle.loaded.value
                ? (this.errorHandler.leaveBreadcrumb("New consent invocation"),
                  me(() => {
                    (wt.consents.preConsent.value = {
                      ...wt.consents.preConsent.value,
                      enabled: !1,
                    }),
                      (wt.consents.postConsent.value = ((e) => {
                        const t = {
                          sendPageEvent: !1,
                          trackConsent: !1,
                          discardPreConsentEvents: !1,
                        };
                        if (C(e)) {
                          const r = g(e);
                          (t.storage = r.storage),
                            A(r.integrations) &&
                              (t.integrations = C(r.integrations)
                                ? r.integrations
                                : Cr),
                            (t.discardPreConsentEvents =
                              !0 === r.discardPreConsentEvents),
                            (t.sendPageEvent = !0 === r.sendPageEvent),
                            (t.trackConsent = !0 === r.trackConsent),
                            B(r.consentManagement) &&
                              (t.consentManagement = R(r.consentManagement, {
                                enabled: wt.consents.enabled.value,
                              }));
                        }
                        return t;
                      })(e));
                    const { initialized: t, consentsData: r } = Rr(
                      wt.consents.postConsent.value.consentManagement,
                      this.logger
                    );
                    (wt.consents.initialized.value =
                      t || wt.consents.initialized.value),
                      (wt.consents.data.value = r);
                  }),
                  wt.consents.enabled.value &&
                    !wt.consents.initialized.value &&
                    this.pluginsManager?.invokeSingle(
                      "consentManager.updateConsentsInfo",
                      wt,
                      this.storeManager,
                      this.logger
                    ),
                  this.storeManager?.initializeStorageState(),
                  this.userSessionManager?.syncStorageDataToState(),
                  this.eventManager?.resume(),
                  this.loadDestinations(),
                  this.sendTrackingEvents(t))
                : (wt.eventBuffer.toBeProcessedArray.value = [
                    ...wt.eventBuffer.toBeProcessedArray.value,
                    ["consent", e],
                  ]);
            }
            sendTrackingEvents(e) {
              if (wt.consents.postConsent.value.trackConsent) {
                const t = L("Consent Management Interaction");
                e
                  ? (wt.eventBuffer.toBeProcessedArray.value = [
                      ...wt.eventBuffer.toBeProcessedArray.value,
                      ["track", t],
                    ])
                  : this.track(t);
              }
              if (wt.consents.postConsent.value.sendPageEvent) {
                const t = j();
                e
                  ? (wt.eventBuffer.toBeProcessedArray.value = [
                      ...wt.eventBuffer.toBeProcessedArray.value,
                      ["page", t],
                    ])
                  : this.page(t);
              }
            }
            setAuthToken(e) {
              this.userSessionManager?.setAuthToken(e);
            }
          }
          class vn {
            static globalSingleton = null;
            analyticsInstances = {};
            defaultAnalyticsKey = "";
            logger = Ue;
            constructor() {
              if (vn.globalSingleton) return vn.globalSingleton;
              Tt.attachErrorListeners(),
                (this.setDefaultInstanceKey =
                  this.setDefaultInstanceKey.bind(this)),
                (this.getAnalyticsInstance =
                  this.getAnalyticsInstance.bind(this)),
                (this.load = this.load.bind(this)),
                (this.ready = this.ready.bind(this)),
                (this.triggerBufferedLoadEvent =
                  this.triggerBufferedLoadEvent.bind(this)),
                (this.page = this.page.bind(this)),
                (this.track = this.track.bind(this)),
                (this.identify = this.identify.bind(this)),
                (this.alias = this.alias.bind(this)),
                (this.group = this.group.bind(this)),
                (this.reset = this.reset.bind(this)),
                (this.getAnonymousId = this.getAnonymousId.bind(this)),
                (this.setAnonymousId = this.setAnonymousId.bind(this)),
                (this.getUserId = this.getUserId.bind(this)),
                (this.getUserTraits = this.getUserTraits.bind(this)),
                (this.getGroupId = this.getGroupId.bind(this)),
                (this.getGroupTraits = this.getGroupTraits.bind(this)),
                (this.startSession = this.startSession.bind(this)),
                (this.endSession = this.endSession.bind(this)),
                (this.getSessionId = this.getSessionId.bind(this)),
                (this.setAuthToken = this.setAuthToken.bind(this)),
                (this.consent = this.consent.bind(this)),
                (vn.globalSingleton = this),
                this.triggerBufferedLoadEvent(),
                (globalThis.rudderanalytics = this);
            }
            setDefaultInstanceKey(e) {
              e && (this.defaultAnalyticsKey = e);
            }
            getAnalyticsInstance(e) {
              const t = e ?? this.defaultAnalyticsKey;
              return (
                Boolean(this.analyticsInstances[t]) ||
                  (this.analyticsInstances[t] = new pn()),
                this.analyticsInstances[t]
              );
            }
            load(e, t, r) {
              _(e)
                ? this.analyticsInstances[e] ||
                  (this.setDefaultInstanceKey(e),
                  (this.analyticsInstances[e] = new pn()),
                  this.getAnalyticsInstance(e).load(e, t, r))
                : this.logger.error(
                    ((e, t) =>
                      `${e}${ce}The write key "${t}" is not a string. Please check that the write key is correct and try again.`)(
                      W,
                      e
                    )
                  );
            }
            triggerBufferedLoadEvent() {
              const e = Array.isArray(globalThis.rudderanalytics)
                ? globalThis.rudderanalytics
                : [];
              ((e) => {
                const t = "consent",
                  r = e.filter((e) => e[0] === t),
                  n = e.filter((e) => e[0] !== t);
                e.splice(0, e.length, ...r, ...n);
              })(e);
              const t = ((e) => {
                let t = [],
                  r = 0;
                for (; r < e.length; ) {
                  if (e[r] && "load" === e[r][0]) {
                    (t = g(e[r])), e.splice(r, 1);
                    break;
                  }
                  r += 1;
                }
                return t;
              })(e);
              ae(te, g(e)),
                t.length > 0 && (t.shift(), this.load.apply(null, t));
            }
            ready(e) {
              this.getAnalyticsInstance().ready(e);
            }
            page(e, t, r, n, i) {
              this.getAnalyticsInstance().page(j(e, t, r, n, i));
            }
            track(e, t, r, n) {
              this.getAnalyticsInstance().track(L(e, t, r, n));
            }
            identify(e, t, r, n) {
              this.getAnalyticsInstance().identify(U(e, t, r, n));
            }
            alias(e, t, r, n) {
              this.getAnalyticsInstance().alias(N(e, t, r, n));
            }
            group(e, t, r, n) {
              0 !== arguments.length
                ? this.getAnalyticsInstance().group(F(e, t, r, n))
                : this.logger.error(
                    `${W}${ce}The group() method must be called with at least one argument.`
                  );
            }
            reset(e) {
              this.getAnalyticsInstance().reset(e);
            }
            getAnonymousId(e) {
              return this.getAnalyticsInstance().getAnonymousId(e);
            }
            setAnonymousId(e, t) {
              this.getAnalyticsInstance().setAnonymousId(e, t);
            }
            getUserId() {
              return this.getAnalyticsInstance().getUserId();
            }
            getUserTraits() {
              return this.getAnalyticsInstance().getUserTraits();
            }
            getGroupId() {
              return this.getAnalyticsInstance().getGroupId();
            }
            getGroupTraits() {
              return this.getAnalyticsInstance().getGroupTraits();
            }
            startSession(e) {
              return this.getAnalyticsInstance().startSession(e);
            }
            endSession() {
              return this.getAnalyticsInstance().endSession();
            }
            getSessionId() {
              return this.getAnalyticsInstance().getSessionId();
            }
            setAuthToken(e) {
              return this.getAnalyticsInstance().setAuthToken(e);
            }
            consent(e) {
              return this.getAnalyticsInstance().consent(e);
            }
          }
          t.RudderAnalytics = vn;
        },
        591: (e, t, r) => {
          "use strict";
          r.r(t),
            r.d(t, {
              connectGlobalObserver: () => M,
              default: () => N,
              disconnectGlobalObserver: () => B,
              validAttributeName: () => n,
            });
          var n = /^[a-zA-Z:_][a-zA-Z0-9:_.-]*$/,
            i = { revert: function () {} },
            s = new Map(),
            o = new Set();
          function a(e) {
            var t = s.get(e);
            return t || ((t = { element: e, attributes: {} }), s.set(e, t)), t;
          }
          function l(e, t, r, n, i) {
            var s = r(e),
              o = {
                isDirty: !1,
                originalValue: s,
                virtualValue: s,
                mutations: [],
                el: e,
                _positionTimeout: null,
                observer: new MutationObserver(function () {
                  if ("position" !== t || !o._positionTimeout) {
                    "position" === t &&
                      (o._positionTimeout = setTimeout(function () {
                        o._positionTimeout = null;
                      }, 1e3));
                    var n = r(e);
                    ("position" === t &&
                      n.parentNode === o.virtualValue.parentNode &&
                      n.insertBeforeNode === o.virtualValue.insertBeforeNode) ||
                      (n !== o.virtualValue && ((o.originalValue = n), i(o)));
                  }
                }),
                mutationRunner: i,
                setValue: n,
                getCurrentValue: r,
              };
            return (
              "position" === t && e.parentNode
                ? o.observer.observe(e.parentNode, {
                    childList: !0,
                    subtree: !0,
                    attributes: !1,
                    characterData: !1,
                  })
                : o.observer.observe(
                    e,
                    (function (e) {
                      return "html" === e
                        ? {
                            childList: !0,
                            subtree: !0,
                            attributes: !0,
                            characterData: !0,
                          }
                        : {
                            childList: !1,
                            subtree: !1,
                            attributes: !0,
                            attributeFilter: [e],
                          };
                    })(t)
                  ),
              o
            );
          }
          function u(e, t) {
            var r = t.getCurrentValue(t.el);
            (t.virtualValue = e),
              e && "string" != typeof e
                ? (r &&
                    e.parentNode === r.parentNode &&
                    e.insertBeforeNode === r.insertBeforeNode) ||
                  ((t.isDirty = !0), C())
                : e !== r && ((t.isDirty = !0), C());
          }
          function c(e) {
            var t = e.originalValue;
            e.mutations.forEach(function (e) {
              return (t = e.mutate(t));
            }),
              u(
                (function (e) {
                  return (
                    E || (E = document.createElement("div")),
                    (E.innerHTML = e),
                    E.innerHTML
                  );
                })(t),
                e
              );
          }
          function d(e) {
            var t = new Set(e.originalValue.split(/\s+/).filter(Boolean));
            e.mutations.forEach(function (e) {
              return e.mutate(t);
            }),
              u(Array.from(t).filter(Boolean).join(" "), e);
          }
          function h(e) {
            var t = e.originalValue;
            e.mutations.forEach(function (e) {
              return (t = e.mutate(t));
            }),
              u(t, e);
          }
          function g(e) {
            var t = e.originalValue;
            e.mutations.forEach(function (e) {
              var r = (function (e) {
                var t = e.parentSelector,
                  r = e.insertBeforeSelector,
                  n = document.querySelector(t);
                if (!n) return null;
                var i = r ? document.querySelector(r) : null;
                return r && !i ? null : { parentNode: n, insertBeforeNode: i };
              })(e.mutate());
              t = r || t;
            }),
              u(t, e);
          }
          var f = function (e) {
              return e.innerHTML;
            },
            p = function (e, t) {
              return (e.innerHTML = t);
            };
          function v(e) {
            var t = a(e);
            return t.html || (t.html = l(e, "html", f, p, c)), t.html;
          }
          var y = function (e) {
              return {
                parentNode: e.parentElement,
                insertBeforeNode: e.nextElementSibling,
              };
            },
            m = function (e, t) {
              (t.insertBeforeNode &&
                !t.parentNode.contains(t.insertBeforeNode)) ||
                t.parentNode.insertBefore(e, t.insertBeforeNode);
            };
          function b(e) {
            var t = a(e);
            return (
              t.position || (t.position = l(e, "position", y, m, g)), t.position
            );
          }
          var k = function (e, t) {
              return t ? (e.className = t) : e.removeAttribute("class");
            },
            _ = function (e) {
              return e.className;
            };
          function S(e) {
            var t = a(e);
            return t.classes || (t.classes = l(e, "class", _, k, d)), t.classes;
          }
          var E,
            w,
            A = function (e) {
              return function (t) {
                var r;
                return null != (r = t.getAttribute(e)) ? r : null;
              };
            },
            I = function (e) {
              return function (t, r) {
                return null !== r ? t.setAttribute(e, r) : t.removeAttribute(e);
              };
            };
          function x(e, t) {
            var r = a(e);
            return (
              r.attributes[t] || (r.attributes[t] = l(e, t, A(t), I(t), h)),
              r.attributes[t]
            );
          }
          function T(e, t, r) {
            if (r.isDirty) {
              r.isDirty = !1;
              var n = r.virtualValue;
              r.mutations.length ||
                (function (e, t) {
                  var r,
                    n,
                    i = s.get(e);
                  if (i)
                    if ("html" === t)
                      null == (r = i.html) ||
                        null == (n = r.observer) ||
                        n.disconnect(),
                        delete i.html;
                    else if ("class" === t) {
                      var o, a;
                      null == (o = i.classes) ||
                        null == (a = o.observer) ||
                        a.disconnect(),
                        delete i.classes;
                    } else if ("position" === t) {
                      var l, u;
                      null == (l = i.position) ||
                        null == (u = l.observer) ||
                        u.disconnect(),
                        delete i.position;
                    } else {
                      var c, d, h;
                      null == (c = i.attributes) ||
                        null == (d = c[t]) ||
                        null == (h = d.observer) ||
                        h.disconnect(),
                        delete i.attributes[t];
                    }
                })(e, t),
                r.setValue(e, n);
            }
          }
          function P(e, t) {
            e.html && T(t, "html", e.html),
              e.classes && T(t, "class", e.classes),
              e.position && T(t, "position", e.position),
              Object.keys(e.attributes).forEach(function (r) {
                T(t, r, e.attributes[r]);
              });
          }
          function C() {
            s.forEach(P);
          }
          function O(e) {
            if ("position" !== e.kind || 1 !== e.elements.size) {
              var t = new Set(e.elements);
              document.querySelectorAll(e.selector).forEach(function (r) {
                t.has(r) ||
                  (e.elements.add(r),
                  (function (e, t) {
                    var r = null;
                    "html" === e.kind
                      ? (r = v(t))
                      : "class" === e.kind
                      ? (r = S(t))
                      : "attribute" === e.kind
                      ? (r = x(t, e.attribute))
                      : "position" === e.kind && (r = b(t)),
                      r && (r.mutations.push(e), r.mutationRunner(r));
                  })(e, r));
              });
            }
          }
          function R() {
            o.forEach(O);
          }
          function B() {
            w && w.disconnect();
          }
          function M() {
            "undefined" != typeof document &&
              (w ||
                (w = new MutationObserver(function () {
                  R();
                })),
              R(),
              w.observe(document.documentElement, {
                childList: !0,
                subtree: !0,
                attributes: !1,
                characterData: !1,
              }));
          }
          function $(e) {
            return "undefined" == typeof document
              ? i
              : (o.add(e),
                O(e),
                {
                  revert: function () {
                    var t;
                    (t = e).elements.forEach(function (e) {
                      return (function (e, t) {
                        var r = null;
                        if (
                          ("html" === e.kind
                            ? (r = v(t))
                            : "class" === e.kind
                            ? (r = S(t))
                            : "attribute" === e.kind
                            ? (r = x(t, e.attribute))
                            : "position" === e.kind && (r = b(t)),
                          r)
                        ) {
                          var n = r.mutations.indexOf(e);
                          -1 !== n && r.mutations.splice(n, 1),
                            r.mutationRunner(r);
                        }
                      })(t, e);
                    }),
                      t.elements.clear(),
                      o.delete(t);
                  },
                });
          }
          function D(e, t) {
            return $({
              kind: "html",
              elements: new Set(),
              mutate: t,
              selector: e,
            });
          }
          function j(e, t) {
            return $({
              kind: "position",
              elements: new Set(),
              mutate: t,
              selector: e,
            });
          }
          function L(e, t) {
            return $({
              kind: "class",
              elements: new Set(),
              mutate: t,
              selector: e,
            });
          }
          function U(e, t, r) {
            return n.test(t)
              ? "class" === t || "className" === t
                ? L(e, function (e) {
                    var t = r(Array.from(e).join(" "));
                    e.clear(),
                      t &&
                        t
                          .split(/\s+/g)
                          .filter(Boolean)
                          .forEach(function (t) {
                            return e.add(t);
                          });
                  })
                : $({
                    kind: "attribute",
                    attribute: t,
                    elements: new Set(),
                    mutate: r,
                    selector: e,
                  })
              : i;
          }
          M();
          const N = {
            html: D,
            classes: L,
            attribute: U,
            position: j,
            declarative: function (e) {
              var t = e.selector,
                r = e.action,
                n = e.value,
                s = e.attribute,
                o = e.parentSelector,
                a = e.insertBeforeSelector;
              if ("html" === s) {
                if ("append" === r)
                  return D(t, function (e) {
                    return e + (null != n ? n : "");
                  });
                if ("set" === r)
                  return D(t, function () {
                    return null != n ? n : "";
                  });
              } else if ("class" === s) {
                if ("append" === r)
                  return L(t, function (e) {
                    n && e.add(n);
                  });
                if ("remove" === r)
                  return L(t, function (e) {
                    n && e.delete(n);
                  });
                if ("set" === r)
                  return L(t, function (e) {
                    e.clear(), n && e.add(n);
                  });
              } else if ("position" === s) {
                if ("set" === r && o)
                  return j(t, function () {
                    return { insertBeforeSelector: a, parentSelector: o };
                  });
              } else {
                if ("append" === r)
                  return U(t, s, function (e) {
                    return null !== e
                      ? e + (null != n ? n : "")
                      : null != n
                      ? n
                      : "";
                  });
                if ("set" === r)
                  return U(t, s, function () {
                    return null != n ? n : "";
                  });
                if ("remove" === r)
                  return U(t, s, function () {
                    return null;
                  });
              }
              return i;
            },
          };
        },
        733: function (e) {
          e.exports = (function () {
            "use strict";
            function e(e) {
              for (var t = 1; t < arguments.length; t++) {
                var r = arguments[t];
                for (var n in r) e[n] = r[n];
              }
              return e;
            }
            return (function t(r, n) {
              function i(t, i, s) {
                if ("undefined" != typeof document) {
                  "number" == typeof (s = e({}, n, s)).expires &&
                    (s.expires = new Date(Date.now() + 864e5 * s.expires)),
                    s.expires && (s.expires = s.expires.toUTCString()),
                    (t = encodeURIComponent(t)
                      .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
                      .replace(/[()]/g, escape));
                  var o = "";
                  for (var a in s)
                    s[a] &&
                      ((o += "; " + a),
                      !0 !== s[a] && (o += "=" + s[a].split(";")[0]));
                  return (document.cookie = t + "=" + r.write(i, t) + o);
                }
              }
              return Object.create(
                {
                  set: i,
                  get: function (e) {
                    if (
                      "undefined" != typeof document &&
                      (!arguments.length || e)
                    ) {
                      for (
                        var t = document.cookie
                            ? document.cookie.split("; ")
                            : [],
                          n = {},
                          i = 0;
                        i < t.length;
                        i++
                      ) {
                        var s = t[i].split("="),
                          o = s.slice(1).join("=");
                        try {
                          var a = decodeURIComponent(s[0]);
                          if (((n[a] = r.read(o, a)), e === a)) break;
                        } catch (e) {}
                      }
                      return e ? n[e] : n;
                    }
                  },
                  remove: function (t, r) {
                    i(t, "", e({}, r, { expires: -1 }));
                  },
                  withAttributes: function (r) {
                    return t(this.converter, e({}, this.attributes, r));
                  },
                  withConverter: function (r) {
                    return t(e({}, this.converter, r), this.attributes);
                  },
                },
                {
                  attributes: { value: Object.freeze(n) },
                  converter: { value: Object.freeze(r) },
                }
              );
            })(
              {
                read: function (e) {
                  return (
                    '"' === e[0] && (e = e.slice(1, -1)),
                    e.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
                  );
                },
                write: function (e) {
                  return encodeURIComponent(e).replace(
                    /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
                    decodeURIComponent
                  );
                },
              },
              { path: "/" }
            );
          })();
        },
        396: function (e, t, r) {
          "use strict";
          var n =
              (this && this.__assign) ||
              function () {
                return (
                  (n =
                    Object.assign ||
                    function (e) {
                      for (var t, r = 1, n = arguments.length; r < n; r++)
                        for (var i in (t = arguments[r]))
                          Object.prototype.hasOwnProperty.call(t, i) &&
                            (e[i] = t[i]);
                      return e;
                    }),
                  n.apply(this, arguments)
                );
              },
            i =
              (this && this.__awaiter) ||
              function (e, t, r, n) {
                return new (r || (r = Promise))(function (i, s) {
                  function o(e) {
                    try {
                      l(n.next(e));
                    } catch (e) {
                      s(e);
                    }
                  }
                  function a(e) {
                    try {
                      l(n.throw(e));
                    } catch (e) {
                      s(e);
                    }
                  }
                  function l(e) {
                    var t;
                    e.done
                      ? i(e.value)
                      : ((t = e.value),
                        t instanceof r
                          ? t
                          : new r(function (e) {
                              e(t);
                            })).then(o, a);
                  }
                  l((n = n.apply(e, t || [])).next());
                });
              },
            s =
              (this && this.__generator) ||
              function (e, t) {
                var r,
                  n,
                  i,
                  s,
                  o = {
                    label: 0,
                    sent: function () {
                      if (1 & i[0]) throw i[1];
                      return i[1];
                    },
                    trys: [],
                    ops: [],
                  };
                return (
                  (s = { next: a(0), throw: a(1), return: a(2) }),
                  "function" == typeof Symbol &&
                    (s[Symbol.iterator] = function () {
                      return this;
                    }),
                  s
                );
                function a(a) {
                  return function (l) {
                    return (function (a) {
                      if (r)
                        throw new TypeError("Generator is already executing.");
                      for (; s && ((s = 0), a[0] && (o = 0)), o; )
                        try {
                          if (
                            ((r = 1),
                            n &&
                              (i =
                                2 & a[0]
                                  ? n.return
                                  : a[0]
                                  ? n.throw || ((i = n.return) && i.call(n), 0)
                                  : n.next) &&
                              !(i = i.call(n, a[1])).done)
                          )
                            return i;
                          switch (
                            ((n = 0), i && (a = [2 & a[0], i.value]), a[0])
                          ) {
                            case 0:
                            case 1:
                              i = a;
                              break;
                            case 4:
                              return o.label++, { value: a[1], done: !1 };
                            case 5:
                              o.label++, (n = a[1]), (a = [0]);
                              continue;
                            case 7:
                              (a = o.ops.pop()), o.trys.pop();
                              continue;
                            default:
                              if (
                                !(
                                  (i =
                                    (i = o.trys).length > 0 &&
                                    i[i.length - 1]) ||
                                  (6 !== a[0] && 2 !== a[0])
                                )
                              ) {
                                o = 0;
                                continue;
                              }
                              if (
                                3 === a[0] &&
                                (!i || (a[1] > i[0] && a[1] < i[3]))
                              ) {
                                o.label = a[1];
                                break;
                              }
                              if (6 === a[0] && o.label < i[1]) {
                                (o.label = i[1]), (i = a);
                                break;
                              }
                              if (i && o.label < i[2]) {
                                (o.label = i[2]), o.ops.push(a);
                                break;
                              }
                              i[2] && o.ops.pop(), o.trys.pop();
                              continue;
                          }
                          a = t.call(e, o);
                        } catch (e) {
                          (a = [6, e]), (n = 0);
                        } finally {
                          r = i = 0;
                        }
                      if (5 & a[0]) throw a[1];
                      return { value: a[0] ? a[1] : void 0, done: !0 };
                    })([a, l]);
                  };
                }
              },
            o =
              (this && this.__importDefault) ||
              function (e) {
                return e && e.__esModule ? e : { default: e };
              };
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.Analytics = t.createAnalyticsInstance = void 0);
          var a = r(316),
            l = r(706),
            u = o(r(733));
          function c(e) {
            var t,
              r,
              o = this,
              c = {},
              d = {},
              h = [],
              g = [],
              f = function (e, r) {
                return null == t ? void 0 : t.getFeatureValue(e, r);
              },
              p = function () {
                return (null == r ? void 0 : r.getUserId()) || "";
              };
            return {
              initialise: function (e) {
                var h = e.growthbookKey,
                  g = e.growthbookDecryptionKey,
                  p = e.rudderstackKey,
                  v = e.growthbookOptions,
                  y = e.disableRudderstackAMD,
                  m = void 0 !== y && y;
                return i(o, void 0, void 0, function () {
                  var e,
                    i,
                    o,
                    y,
                    b,
                    k,
                    _,
                    S,
                    E,
                    w,
                    A,
                    I,
                    x,
                    T,
                    P,
                    C,
                    O,
                    R,
                    B,
                    M,
                    $;
                  return s(this, function (s) {
                    switch (s.label) {
                      case 0:
                        return [
                          4,
                          fetch("https://www.cloudflare.com/cdn-cgi/trace"),
                        ];
                      case 1:
                        return [4, null == (e = s.sent()) ? void 0 : e.text()];
                      case 2:
                        if (
                          ((i = s.sent()),
                          (o = Object.fromEntries(
                            i.split("\n").map(function (e) {
                              return e.split("=", 2);
                            })
                          ).loc.toLowerCase()),
                          (y = u.default.get("website_status")))
                        )
                          try {
                            b = JSON.parse(y);
                          } catch (e) {
                            console.error("Failed to parse cookie: ", e);
                          }
                        try {
                          (k =
                            u.default.get("clients_country") ||
                            (null == b ? void 0 : b.clients_country) ||
                            o),
                            (r = l.RudderStack.getRudderStackInstance(p, m)),
                            (null == v ? void 0 : v.attributes) &&
                              Object.keys(v.attributes).length > 0 &&
                              (c = n(
                                n(
                                  n(
                                    n(
                                      n(
                                        n(
                                          n(
                                            n(
                                              n({}, c),
                                              (null ===
                                                (S =
                                                  null == v
                                                    ? void 0
                                                    : v.attributes) ||
                                              void 0 === S
                                                ? void 0
                                                : S.country) && { country: k }
                                            ),
                                            (null ===
                                              (E =
                                                null == v
                                                  ? void 0
                                                  : v.attributes) ||
                                            void 0 === E
                                              ? void 0
                                              : E.user_language) && {
                                              user_language:
                                                null == v
                                                  ? void 0
                                                  : v.attributes.user_language,
                                            }
                                          ),
                                          (null ===
                                            (w =
                                              null == v
                                                ? void 0
                                                : v.attributes) || void 0 === w
                                            ? void 0
                                            : w.account_type) && {
                                            account_type:
                                              null == v
                                                ? void 0
                                                : v.attributes.account_type,
                                          }
                                        ),
                                        (null ===
                                          (A =
                                            null == v
                                              ? void 0
                                              : v.attributes) || void 0 === A
                                          ? void 0
                                          : A.app_id) && {
                                          app_id:
                                            null == v
                                              ? void 0
                                              : v.attributes.app_id,
                                        }
                                      ),
                                      (null ===
                                        (I =
                                          null == v ? void 0 : v.attributes) ||
                                      void 0 === I
                                        ? void 0
                                        : I.residence_country) && {
                                        residence_country:
                                          null ===
                                            (x =
                                              null == v
                                                ? void 0
                                                : v.attributes) || void 0 === x
                                            ? void 0
                                            : x.residence_country,
                                      }
                                    ),
                                    (null ===
                                      (T = null == v ? void 0 : v.attributes) ||
                                    void 0 === T
                                      ? void 0
                                      : T.device_type) && {
                                      device_type:
                                        null == v
                                          ? void 0
                                          : v.attributes.device_type,
                                    }
                                  ),
                                  (null ===
                                    (P = null == v ? void 0 : v.attributes) ||
                                  void 0 === P
                                    ? void 0
                                    : P.url) && {
                                    url: null == v ? void 0 : v.attributes.url,
                                  }
                                ),
                                (null == v ? void 0 : v.attributes) && {
                                  loggedIn: !!(null ===
                                    (C = null == v ? void 0 : v.attributes) ||
                                  void 0 === C
                                    ? void 0
                                    : C.loggedIn),
                                }
                              )),
                            null != v || (v = {}),
                            (null !== (O = v.attributes) && void 0 !== O) ||
                              (v.attributes = {}),
                            (null !== (R = (M = v.attributes).id) &&
                              void 0 !== R) ||
                              (M.id = r.getAnonymousId()),
                            (null !== (B = ($ = v.attributes).country) &&
                              void 0 !== B) ||
                              ($.country = k),
                            h &&
                              ((t = a.Growthbook.getGrowthBookInstance(
                                h,
                                g,
                                v
                              )),
                              (_ = setInterval(function () {
                                Object.keys(d).length > 0
                                  ? clearInterval(_)
                                  : (d = f("tracking-buttons-config", {}));
                              }, 1e3)));
                        } catch (e) {
                          console.log("Error in initializing analytics", e);
                        }
                        return [2];
                    }
                  });
                });
              },
              setAttributes: function (e) {
                var i = e.country,
                  s = e.user_language,
                  o = e.device_language,
                  a = e.device_type,
                  l = e.account_type,
                  u = e.user_id,
                  d = e.app_id,
                  h = e.utm_source,
                  g = e.utm_medium,
                  f = e.utm_campaign,
                  v = e.is_authorised,
                  y = e.residence_country,
                  m = e.url,
                  b = e.domain,
                  k = e.geo_location,
                  _ = e.loggedIn;
                if (t || r) {
                  var S = null != u ? u : p();
                  if (t) {
                    var E = {
                      country: i,
                      residence_country: y,
                      user_language: s,
                      device_language: o,
                      device_type: a,
                      utm_source: h,
                      utm_medium: g,
                      utm_campaign: f,
                      is_authorised: v,
                      url: m,
                      domain: b,
                      loggedIn: _,
                    };
                    S && (E.id = S), t.setAttributes(E);
                  }
                  c = n(
                    n(
                      n(
                        n(
                          n(
                            n(
                              n(
                                n(
                                  n(n({}, c), i && { country: i }),
                                  k && { geo_location: k }
                                ),
                                s && { user_language: s }
                              ),
                              l && { account_type: l }
                            ),
                            d && { app_id: d }
                          ),
                          y && { residence_country: y }
                        ),
                        a && { device_type: a }
                      ),
                      m && { url: m }
                    ),
                    _ && { loggedIn: _ }
                  );
                }
              },
              identifyEvent: function (e) {
                var t = e || p();
                r &&
                  (null == r ||
                    r.identifyEvent(t, {
                      language: (null == c ? void 0 : c.user_language) || "en",
                    }));
              },
              getFeatureState: function (e) {
                var r, n;
                return null ===
                  (n =
                    null === (r = null == t ? void 0 : t.getFeatureState(e)) ||
                    void 0 === r
                      ? void 0
                      : r.experimentResult) || void 0 === n
                  ? void 0
                  : n.name;
              },
              getFeatureValue: f,
              isFeatureOn: function (e) {
                return null == t ? void 0 : t.isOn(e);
              },
              setUrl: function (e) {
                return null == t ? void 0 : t.setUrl(e);
              },
              getId: p,
              trackEvent: function (e, t) {
                navigator.onLine && r
                  ? (h.length > 0 &&
                      h.forEach(function (e, t) {
                        r.track(e.event, e.payload), delete h[t];
                      }),
                    e in d
                      ? d[e] && (null == r || r.track(e, n(n({}, c), t)))
                      : null == r || r.track(e, n(n({}, c), t)))
                  : h.push({ event: e, payload: n(n({}, c), t) });
              },
              getInstances: function () {
                return { ab: t, tracking: r };
              },
              pageView: function (e, t) {
                if (
                  (void 0 === t && (t = "Deriv App"), !navigator.onLine || !r)
                )
                  return g.push({ current_page: e, platform: t, user_id: p() });
                g.length > 0 &&
                  g.forEach(function (e, t) {
                    null == r ||
                      r.pageView(e.current_page, e.platform, e.user_id),
                      delete g[t];
                  }),
                  null == r || r.pageView(e, t, p());
              },
              reset: function () {
                r && (null == r || r.reset());
              },
            };
          }
          (t.createAnalyticsInstance = c), (t.Analytics = c());
        },
        316: function (e, t, r) {
          "use strict";
          var n =
              (this && this.__assign) ||
              function () {
                return (
                  (n =
                    Object.assign ||
                    function (e) {
                      for (var t, r = 1, n = arguments.length; r < n; r++)
                        for (var i in (t = arguments[r]))
                          Object.prototype.hasOwnProperty.call(t, i) &&
                            (e[i] = t[i]);
                      return e;
                    }),
                  n.apply(this, arguments)
                );
              },
            i =
              (this && this.__awaiter) ||
              function (e, t, r, n) {
                return new (r || (r = Promise))(function (i, s) {
                  function o(e) {
                    try {
                      l(n.next(e));
                    } catch (e) {
                      s(e);
                    }
                  }
                  function a(e) {
                    try {
                      l(n.throw(e));
                    } catch (e) {
                      s(e);
                    }
                  }
                  function l(e) {
                    var t;
                    e.done
                      ? i(e.value)
                      : ((t = e.value),
                        t instanceof r
                          ? t
                          : new r(function (e) {
                              e(t);
                            })).then(o, a);
                  }
                  l((n = n.apply(e, t || [])).next());
                });
              },
            s =
              (this && this.__generator) ||
              function (e, t) {
                var r,
                  n,
                  i,
                  s,
                  o = {
                    label: 0,
                    sent: function () {
                      if (1 & i[0]) throw i[1];
                      return i[1];
                    },
                    trys: [],
                    ops: [],
                  };
                return (
                  (s = { next: a(0), throw: a(1), return: a(2) }),
                  "function" == typeof Symbol &&
                    (s[Symbol.iterator] = function () {
                      return this;
                    }),
                  s
                );
                function a(a) {
                  return function (l) {
                    return (function (a) {
                      if (r)
                        throw new TypeError("Generator is already executing.");
                      for (; s && ((s = 0), a[0] && (o = 0)), o; )
                        try {
                          if (
                            ((r = 1),
                            n &&
                              (i =
                                2 & a[0]
                                  ? n.return
                                  : a[0]
                                  ? n.throw || ((i = n.return) && i.call(n), 0)
                                  : n.next) &&
                              !(i = i.call(n, a[1])).done)
                          )
                            return i;
                          switch (
                            ((n = 0), i && (a = [2 & a[0], i.value]), a[0])
                          ) {
                            case 0:
                            case 1:
                              i = a;
                              break;
                            case 4:
                              return o.label++, { value: a[1], done: !1 };
                            case 5:
                              o.label++, (n = a[1]), (a = [0]);
                              continue;
                            case 7:
                              (a = o.ops.pop()), o.trys.pop();
                              continue;
                            default:
                              if (
                                !(
                                  (i =
                                    (i = o.trys).length > 0 &&
                                    i[i.length - 1]) ||
                                  (6 !== a[0] && 2 !== a[0])
                                )
                              ) {
                                o = 0;
                                continue;
                              }
                              if (
                                3 === a[0] &&
                                (!i || (a[1] > i[0] && a[1] < i[3]))
                              ) {
                                o.label = a[1];
                                break;
                              }
                              if (6 === a[0] && o.label < i[1]) {
                                (o.label = i[1]), (i = a);
                                break;
                              }
                              if (i && o.label < i[2]) {
                                (o.label = i[2]), o.ops.push(a);
                                break;
                              }
                              i[2] && o.ops.pop(), o.trys.pop();
                              continue;
                          }
                          a = t.call(e, o);
                        } catch (e) {
                          (a = [6, e]), (n = 0);
                        } finally {
                          r = i = 0;
                        }
                      if (5 & a[0]) throw a[1];
                      return { value: a[0] ? a[1] : void 0, done: !0 };
                    })([a, l]);
                  };
                }
              };
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.Growthbook = void 0);
          var o = r(200),
            a = r(182),
            l = (function () {
              function e(e, t, r) {
                void 0 === r && (r = {});
                var l = this;
                (this.analytics = new a.RudderAnalytics()),
                  (this.setAttributes = function (e) {
                    var t = e.id,
                      r = e.country,
                      i = e.user_language,
                      s = e.device_language,
                      o = e.device_type,
                      a = e.utm_source,
                      u = e.utm_medium,
                      c = e.utm_campaign,
                      d = e.is_authorised,
                      h = e.url,
                      g = e.domain,
                      f = e.utm_content,
                      p = e.residence_country,
                      v = e.loggedIn,
                      y = l.GrowthBook.getAttributes();
                    l.GrowthBook.setAttributes(
                      n(
                        n(
                          n(
                            n(
                              n(
                                n(
                                  n(
                                    n(
                                      n(
                                        n(
                                          n(
                                            n(
                                              n(
                                                n(n({}, y), { id: t }),
                                                r && { country: r }
                                              ),
                                              p && { residence_country: p }
                                            ),
                                            i && { user_language: i }
                                          ),
                                          s && { device_language: s }
                                        ),
                                        o && { device_type: o }
                                      ),
                                      a && { utm_source: a }
                                    ),
                                    u && { utm_medium: u }
                                  ),
                                  c && { utm_campaign: c }
                                ),
                                d && { is_authorised: d }
                              ),
                              h && { url: h }
                            ),
                            g && { domain: g }
                          ),
                          f && { utm_content: f }
                        ),
                        v && { loggedIn: v }
                      )
                    );
                  }),
                  (this.getFeatureValue = function (e, t) {
                    return l.GrowthBook.getFeatureValue(e, t);
                  }),
                  (this.getFeatureState = function (e) {
                    return l.GrowthBook.evalFeature(e);
                  }),
                  (this.setUrl = function (e) {
                    return l.GrowthBook.setURL(e);
                  }),
                  (this.isOn = function (e) {
                    return l.GrowthBook.isOn(e);
                  }),
                  (this.init = function () {
                    return i(l, void 0, void 0, function () {
                      return s(this, function (e) {
                        switch (e.label) {
                          case 0:
                            return [
                              4,
                              this.GrowthBook.init({ timeout: 2e3 }).catch(
                                function (e) {
                                  return console.error(e);
                                }
                              ),
                            ];
                          case 1:
                            return [2, e.sent()];
                        }
                      });
                    });
                  }),
                  (this.GrowthBook = new o.GrowthBook(
                    n(
                      {
                        apiHost: "https://cdn.growthbook.io",
                        clientKey: e,
                        decryptionKey: t,
                        antiFlicker: !1,
                        navigateDelay: 0,
                        antiFlickerTimeout: 3500,
                        subscribeToChanges: !0,
                        enableDevMode:
                          null === window || void 0 === window
                            ? void 0
                            : window.location.hostname.includes("localhost"),
                        trackingCallback: function (e, t) {
                          window.dataLayer &&
                            window.dataLayer.push({
                              event: "experiment_viewed",
                              event_category: "experiment",
                              rudder_anonymous_id: l.analytics.getAnonymousId(),
                              experiment_id: e.key,
                              variation_id: t.variationId,
                            }),
                            l.analytics.track("experiment_viewed", {
                              experimentId: e.key,
                              variationId: t.variationId,
                            });
                        },
                      },
                      r
                    )
                  )),
                  this.init();
              }
              return (
                (e.getGrowthBookInstance = function (t, r, n) {
                  return (
                    e._instance ||
                      (e._instance = new e(t, null != r ? r : "", n)),
                    e._instance
                  );
                }),
                e
              );
            })();
          t.Growthbook = l;
        },
        706: function (e, t, r) {
          "use strict";
          var n =
            (this && this.__importDefault) ||
            function (e) {
              return e && e.__esModule ? e : { default: e };
            };
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.RudderStack = void 0);
          var i = r(182),
            s = r(831),
            o = n(r(733)),
            a = (function () {
              function e(e, t) {
                void 0 === t && (t = !1);
                var r = this;
                (this.analytics = new i.RudderAnalytics()),
                  (this.has_identified = !1),
                  (this.has_initialized = !1),
                  (this.current_page = ""),
                  (this.rudderstack_anonymous_cookie_key =
                    "rudder_anonymous_id"),
                  (this.getAnonymousId = function () {
                    var e;
                    return null ===
                      (e = document.cookie.match(
                        "(^|;)\\s*" +
                          r.rudderstack_anonymous_cookie_key +
                          "\\s*=\\s*([^;]+)"
                      )) || void 0 === e
                      ? void 0
                      : e.pop();
                  }),
                  (this.setCookieIfNotExists = function () {
                    if (!r.getAnonymousId()) {
                      var e = window.location.hostname
                        .split(".")
                        .slice(-2)
                        .join(".");
                      document.cookie = ""
                        .concat(r.rudderstack_anonymous_cookie_key, "=")
                        .concat((0, s.v6)(), "; path=/; Domain=")
                        .concat(e);
                    }
                  }),
                  (this.getUserId = function () {
                    return r.analytics.getUserId();
                  }),
                  (this.handleCachedEvents = function () {
                    var e = o.default.get("cached_analytics_events"),
                      t = o.default.get("cached_analytics_page_views");
                    try {
                      if (e) {
                        var n = JSON.parse(e);
                        Array.isArray(n) &&
                          n.length > 0 &&
                          (n.forEach(function (e) {
                            r.analytics.track(e.name, e.properties);
                          }),
                          o.default.remove("cached_analytics_events", {
                            domain: ".deriv.com",
                          }));
                      }
                      if (t) {
                        var i = JSON.parse(t);
                        Array.isArray(i) &&
                          i.length > 0 &&
                          (i.forEach(function (e) {
                            r.analytics.page(
                              null == e ? void 0 : e.name,
                              null == e ? void 0 : e.properties
                            );
                          }),
                          o.default.remove("cached_analytics_page_views", {
                            domain: ".deriv.com",
                          }));
                      }
                    } catch (e) {
                      console.log(e);
                    }
                  }),
                  (this.init = function (e, t) {
                    var n;
                    void 0 === t && (t = !1),
                      e &&
                        (t && ((n = window.define), (window.define = void 0)),
                        r.setCookieIfNotExists(),
                        r.analytics.load(
                          e,
                          "https://deriv-dataplane.rudderstack.com",
                          {
                            externalAnonymousIdCookieName:
                              r.rudderstack_anonymous_cookie_key,
                          }
                        ),
                        r.analytics.ready(function () {
                          t && (window.define = n),
                            (r.has_initialized = !0),
                            (r.has_identified = !(
                              !r.getUserId() && !r.getAnonymousId()
                            )),
                            r.handleCachedEvents();
                        }));
                  }),
                  (this.identifyEvent = function (e, t) {
                    r.analytics.identify(e, t), (r.has_identified = !0);
                  }),
                  (this.pageView = function (e, t, n) {
                    void 0 === t && (t = "Deriv App"),
                      r.has_initialized &&
                        r.has_identified &&
                        e !== r.current_page &&
                        (r.analytics.page(t, e, { user_id: n }),
                        (r.current_page = e));
                  }),
                  (this.reset = function () {
                    r.has_initialized &&
                      (r.analytics.reset(), (r.has_identified = !1));
                  }),
                  (this.track = function (e, t) {
                    var n = Object.fromEntries(
                      Object.entries(t).filter(function (e) {
                        return e[0], void 0 !== e[1];
                      })
                    );
                    if (r.has_initialized && r.has_identified)
                      try {
                        r.analytics.track(e, n);
                      } catch (e) {
                        console.error(e);
                      }
                  }),
                  this.init(e, t);
              }
              return (
                (e.getRudderStackInstance = function (t, r) {
                  return (
                    void 0 === r && (r = !1),
                    e._instance || (e._instance = new e(t, r)),
                    e._instance
                  );
                }),
                e
              );
            })();
          t.RudderStack = a;
        },
        831: (e, t, r) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            Object.defineProperty(t, "MAX", {
              enumerable: !0,
              get: function () {
                return n.default;
              },
            }),
            Object.defineProperty(t, "NIL", {
              enumerable: !0,
              get: function () {
                return i.default;
              },
            }),
            Object.defineProperty(t, "parse", {
              enumerable: !0,
              get: function () {
                return s.default;
              },
            }),
            Object.defineProperty(t, "stringify", {
              enumerable: !0,
              get: function () {
                return o.default;
              },
            }),
            Object.defineProperty(t, "v1", {
              enumerable: !0,
              get: function () {
                return a.default;
              },
            }),
            Object.defineProperty(t, "v1ToV6", {
              enumerable: !0,
              get: function () {
                return l.default;
              },
            }),
            Object.defineProperty(t, "v3", {
              enumerable: !0,
              get: function () {
                return u.default;
              },
            }),
            Object.defineProperty(t, "v4", {
              enumerable: !0,
              get: function () {
                return c.default;
              },
            }),
            Object.defineProperty(t, "v5", {
              enumerable: !0,
              get: function () {
                return d.default;
              },
            }),
            Object.defineProperty(t, "v6", {
              enumerable: !0,
              get: function () {
                return h.default;
              },
            }),
            Object.defineProperty(t, "v6ToV1", {
              enumerable: !0,
              get: function () {
                return g.default;
              },
            }),
            Object.defineProperty(t, "v7", {
              enumerable: !0,
              get: function () {
                return f.default;
              },
            }),
            Object.defineProperty(t, "validate", {
              enumerable: !0,
              get: function () {
                return p.default;
              },
            }),
            Object.defineProperty(t, "version", {
              enumerable: !0,
              get: function () {
                return v.default;
              },
            });
          var n = y(r(213)),
            i = y(r(808)),
            s = y(r(792)),
            o = y(r(910)),
            a = y(r(518)),
            l = y(r(343)),
            u = y(r(948)),
            c = y(r(73)),
            d = y(r(186)),
            h = y(r(671)),
            g = y(r(507)),
            f = y(r(744)),
            p = y(r(37)),
            v = y(r(775));
          function y(e) {
            return e && e.__esModule ? e : { default: e };
          }
        },
        213: (e, t) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.default = void 0),
            (t.default = "ffffffff-ffff-ffff-ffff-ffffffffffff");
        },
        311: (e, t) => {
          "use strict";
          function r(e) {
            return 14 + (((e + 64) >>> 9) << 4) + 1;
          }
          function n(e, t) {
            var r = (65535 & e) + (65535 & t);
            return (((e >> 16) + (t >> 16) + (r >> 16)) << 16) | (65535 & r);
          }
          function i(e, t, r, i, s, o) {
            return n(
              ((a = n(n(t, e), n(i, o))) << (l = s)) | (a >>> (32 - l)),
              r
            );
            var a, l;
          }
          function s(e, t, r, n, s, o, a) {
            return i((t & r) | (~t & n), e, t, s, o, a);
          }
          function o(e, t, r, n, s, o, a) {
            return i((t & n) | (r & ~n), e, t, s, o, a);
          }
          function a(e, t, r, n, s, o, a) {
            return i(t ^ r ^ n, e, t, s, o, a);
          }
          function l(e, t, r, n, s, o, a) {
            return i(r ^ (t | ~n), e, t, s, o, a);
          }
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.default = void 0),
            (t.default = function (e) {
              if ("string" == typeof e) {
                var t = unescape(encodeURIComponent(e));
                e = new Uint8Array(t.length);
                for (var i = 0; i < t.length; ++i) e[i] = t.charCodeAt(i);
              }
              return (function (e) {
                for (
                  var t = [], r = 32 * e.length, n = "0123456789abcdef", i = 0;
                  i < r;
                  i += 8
                ) {
                  var s = (e[i >> 5] >>> i % 32) & 255,
                    o = parseInt(
                      n.charAt((s >>> 4) & 15) + n.charAt(15 & s),
                      16
                    );
                  t.push(o);
                }
                return t;
              })(
                (function (e, t) {
                  (e[t >> 5] |= 128 << t % 32), (e[r(t) - 1] = t);
                  for (
                    var i = 1732584193,
                      u = -271733879,
                      c = -1732584194,
                      d = 271733878,
                      h = 0;
                    h < e.length;
                    h += 16
                  ) {
                    var g = i,
                      f = u,
                      p = c,
                      v = d;
                    (i = s(i, u, c, d, e[h], 7, -680876936)),
                      (d = s(d, i, u, c, e[h + 1], 12, -389564586)),
                      (c = s(c, d, i, u, e[h + 2], 17, 606105819)),
                      (u = s(u, c, d, i, e[h + 3], 22, -1044525330)),
                      (i = s(i, u, c, d, e[h + 4], 7, -176418897)),
                      (d = s(d, i, u, c, e[h + 5], 12, 1200080426)),
                      (c = s(c, d, i, u, e[h + 6], 17, -1473231341)),
                      (u = s(u, c, d, i, e[h + 7], 22, -45705983)),
                      (i = s(i, u, c, d, e[h + 8], 7, 1770035416)),
                      (d = s(d, i, u, c, e[h + 9], 12, -1958414417)),
                      (c = s(c, d, i, u, e[h + 10], 17, -42063)),
                      (u = s(u, c, d, i, e[h + 11], 22, -1990404162)),
                      (i = s(i, u, c, d, e[h + 12], 7, 1804603682)),
                      (d = s(d, i, u, c, e[h + 13], 12, -40341101)),
                      (c = s(c, d, i, u, e[h + 14], 17, -1502002290)),
                      (i = o(
                        i,
                        (u = s(u, c, d, i, e[h + 15], 22, 1236535329)),
                        c,
                        d,
                        e[h + 1],
                        5,
                        -165796510
                      )),
                      (d = o(d, i, u, c, e[h + 6], 9, -1069501632)),
                      (c = o(c, d, i, u, e[h + 11], 14, 643717713)),
                      (u = o(u, c, d, i, e[h], 20, -373897302)),
                      (i = o(i, u, c, d, e[h + 5], 5, -701558691)),
                      (d = o(d, i, u, c, e[h + 10], 9, 38016083)),
                      (c = o(c, d, i, u, e[h + 15], 14, -660478335)),
                      (u = o(u, c, d, i, e[h + 4], 20, -405537848)),
                      (i = o(i, u, c, d, e[h + 9], 5, 568446438)),
                      (d = o(d, i, u, c, e[h + 14], 9, -1019803690)),
                      (c = o(c, d, i, u, e[h + 3], 14, -187363961)),
                      (u = o(u, c, d, i, e[h + 8], 20, 1163531501)),
                      (i = o(i, u, c, d, e[h + 13], 5, -1444681467)),
                      (d = o(d, i, u, c, e[h + 2], 9, -51403784)),
                      (c = o(c, d, i, u, e[h + 7], 14, 1735328473)),
                      (i = a(
                        i,
                        (u = o(u, c, d, i, e[h + 12], 20, -1926607734)),
                        c,
                        d,
                        e[h + 5],
                        4,
                        -378558
                      )),
                      (d = a(d, i, u, c, e[h + 8], 11, -2022574463)),
                      (c = a(c, d, i, u, e[h + 11], 16, 1839030562)),
                      (u = a(u, c, d, i, e[h + 14], 23, -35309556)),
                      (i = a(i, u, c, d, e[h + 1], 4, -1530992060)),
                      (d = a(d, i, u, c, e[h + 4], 11, 1272893353)),
                      (c = a(c, d, i, u, e[h + 7], 16, -155497632)),
                      (u = a(u, c, d, i, e[h + 10], 23, -1094730640)),
                      (i = a(i, u, c, d, e[h + 13], 4, 681279174)),
                      (d = a(d, i, u, c, e[h], 11, -358537222)),
                      (c = a(c, d, i, u, e[h + 3], 16, -722521979)),
                      (u = a(u, c, d, i, e[h + 6], 23, 76029189)),
                      (i = a(i, u, c, d, e[h + 9], 4, -640364487)),
                      (d = a(d, i, u, c, e[h + 12], 11, -421815835)),
                      (c = a(c, d, i, u, e[h + 15], 16, 530742520)),
                      (i = l(
                        i,
                        (u = a(u, c, d, i, e[h + 2], 23, -995338651)),
                        c,
                        d,
                        e[h],
                        6,
                        -198630844
                      )),
                      (d = l(d, i, u, c, e[h + 7], 10, 1126891415)),
                      (c = l(c, d, i, u, e[h + 14], 15, -1416354905)),
                      (u = l(u, c, d, i, e[h + 5], 21, -57434055)),
                      (i = l(i, u, c, d, e[h + 12], 6, 1700485571)),
                      (d = l(d, i, u, c, e[h + 3], 10, -1894986606)),
                      (c = l(c, d, i, u, e[h + 10], 15, -1051523)),
                      (u = l(u, c, d, i, e[h + 1], 21, -2054922799)),
                      (i = l(i, u, c, d, e[h + 8], 6, 1873313359)),
                      (d = l(d, i, u, c, e[h + 15], 10, -30611744)),
                      (c = l(c, d, i, u, e[h + 6], 15, -1560198380)),
                      (u = l(u, c, d, i, e[h + 13], 21, 1309151649)),
                      (i = l(i, u, c, d, e[h + 4], 6, -145523070)),
                      (d = l(d, i, u, c, e[h + 11], 10, -1120210379)),
                      (c = l(c, d, i, u, e[h + 2], 15, 718787259)),
                      (u = l(u, c, d, i, e[h + 9], 21, -343485551)),
                      (i = n(i, g)),
                      (u = n(u, f)),
                      (c = n(c, p)),
                      (d = n(d, v));
                  }
                  return [i, u, c, d];
                })(
                  (function (e) {
                    if (0 === e.length) return [];
                    for (
                      var t = 8 * e.length, n = new Uint32Array(r(t)), i = 0;
                      i < t;
                      i += 8
                    )
                      n[i >> 5] |= (255 & e[i / 8]) << i % 32;
                    return n;
                  })(e),
                  8 * e.length
                )
              );
            });
        },
        140: (e, t) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.default = void 0);
          var r =
            "undefined" != typeof crypto &&
            crypto.randomUUID &&
            crypto.randomUUID.bind(crypto);
          t.default = { randomUUID: r };
        },
        808: (e, t) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.default = void 0),
            (t.default = "00000000-0000-0000-0000-000000000000");
        },
        792: (e, t, r) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.default = void 0);
          var n,
            i = (n = r(37)) && n.__esModule ? n : { default: n };
          t.default = function (e) {
            if (!(0, i.default)(e)) throw TypeError("Invalid UUID");
            var t,
              r = new Uint8Array(16);
            return (
              (r[0] = (t = parseInt(e.slice(0, 8), 16)) >>> 24),
              (r[1] = (t >>> 16) & 255),
              (r[2] = (t >>> 8) & 255),
              (r[3] = 255 & t),
              (r[4] = (t = parseInt(e.slice(9, 13), 16)) >>> 8),
              (r[5] = 255 & t),
              (r[6] = (t = parseInt(e.slice(14, 18), 16)) >>> 8),
              (r[7] = 255 & t),
              (r[8] = (t = parseInt(e.slice(19, 23), 16)) >>> 8),
              (r[9] = 255 & t),
              (r[10] =
                ((t = parseInt(e.slice(24, 36), 16)) / 1099511627776) & 255),
              (r[11] = (t / 4294967296) & 255),
              (r[12] = (t >>> 24) & 255),
              (r[13] = (t >>> 16) & 255),
              (r[14] = (t >>> 8) & 255),
              (r[15] = 255 & t),
              r
            );
          };
        },
        656: (e, t) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.default = void 0),
            (t.default =
              /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i);
        },
        858: (e, t) => {
          "use strict";
          var r;
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.default = function () {
              if (
                !r &&
                !(r =
                  "undefined" != typeof crypto &&
                  crypto.getRandomValues &&
                  crypto.getRandomValues.bind(crypto))
              )
                throw new Error(
                  "crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported"
                );
              return r(n);
            });
          var n = new Uint8Array(16);
        },
        42: (e, t) => {
          "use strict";
          function r(e, t, r, n) {
            switch (e) {
              case 0:
                return (t & r) ^ (~t & n);
              case 1:
              case 3:
                return t ^ r ^ n;
              case 2:
                return (t & r) ^ (t & n) ^ (r & n);
            }
          }
          function n(e, t) {
            return (e << t) | (e >>> (32 - t));
          }
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.default = void 0),
            (t.default = function (e) {
              var t = [1518500249, 1859775393, 2400959708, 3395469782],
                i = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
              if ("string" == typeof e) {
                var s = unescape(encodeURIComponent(e));
                e = [];
                for (var o = 0; o < s.length; ++o) e.push(s.charCodeAt(o));
              } else Array.isArray(e) || (e = Array.prototype.slice.call(e));
              e.push(128);
              for (
                var a = e.length / 4 + 2,
                  l = Math.ceil(a / 16),
                  u = new Array(l),
                  c = 0;
                c < l;
                ++c
              ) {
                for (var d = new Uint32Array(16), h = 0; h < 16; ++h)
                  d[h] =
                    (e[64 * c + 4 * h] << 24) |
                    (e[64 * c + 4 * h + 1] << 16) |
                    (e[64 * c + 4 * h + 2] << 8) |
                    e[64 * c + 4 * h + 3];
                u[c] = d;
              }
              (u[l - 1][14] = (8 * (e.length - 1)) / Math.pow(2, 32)),
                (u[l - 1][14] = Math.floor(u[l - 1][14])),
                (u[l - 1][15] = (8 * (e.length - 1)) & 4294967295);
              for (var g = 0; g < l; ++g) {
                for (var f = new Uint32Array(80), p = 0; p < 16; ++p)
                  f[p] = u[g][p];
                for (var v = 16; v < 80; ++v)
                  f[v] = n(f[v - 3] ^ f[v - 8] ^ f[v - 14] ^ f[v - 16], 1);
                for (
                  var y = i[0], m = i[1], b = i[2], k = i[3], _ = i[4], S = 0;
                  S < 80;
                  ++S
                ) {
                  var E = Math.floor(S / 20),
                    w = (n(y, 5) + r(E, m, b, k) + _ + t[E] + f[S]) >>> 0;
                  (_ = k), (k = b), (b = n(m, 30) >>> 0), (m = y), (y = w);
                }
                (i[0] = (i[0] + y) >>> 0),
                  (i[1] = (i[1] + m) >>> 0),
                  (i[2] = (i[2] + b) >>> 0),
                  (i[3] = (i[3] + k) >>> 0),
                  (i[4] = (i[4] + _) >>> 0);
              }
              return [
                (i[0] >> 24) & 255,
                (i[0] >> 16) & 255,
                (i[0] >> 8) & 255,
                255 & i[0],
                (i[1] >> 24) & 255,
                (i[1] >> 16) & 255,
                (i[1] >> 8) & 255,
                255 & i[1],
                (i[2] >> 24) & 255,
                (i[2] >> 16) & 255,
                (i[2] >> 8) & 255,
                255 & i[2],
                (i[3] >> 24) & 255,
                (i[3] >> 16) & 255,
                (i[3] >> 8) & 255,
                255 & i[3],
                (i[4] >> 24) & 255,
                (i[4] >> 16) & 255,
                (i[4] >> 8) & 255,
                255 & i[4],
              ];
            });
        },
        910: (e, t, r) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.default = void 0),
            (t.unsafeStringify = a);
          for (
            var n,
              i = (n = r(37)) && n.__esModule ? n : { default: n },
              s = [],
              o = 0;
            o < 256;
            ++o
          )
            s.push((o + 256).toString(16).slice(1));
          function a(e, t = 0) {
            return (
              s[e[t + 0]] +
              s[e[t + 1]] +
              s[e[t + 2]] +
              s[e[t + 3]] +
              "-" +
              s[e[t + 4]] +
              s[e[t + 5]] +
              "-" +
              s[e[t + 6]] +
              s[e[t + 7]] +
              "-" +
              s[e[t + 8]] +
              s[e[t + 9]] +
              "-" +
              s[e[t + 10]] +
              s[e[t + 11]] +
              s[e[t + 12]] +
              s[e[t + 13]] +
              s[e[t + 14]] +
              s[e[t + 15]]
            ).toLowerCase();
          }
          t.default = function (e, t = 0) {
            var r = a(e, t);
            if (!(0, i.default)(r))
              throw TypeError("Stringified UUID is invalid");
            return r;
          };
        },
        518: (e, t, r) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.default = void 0);
          var n,
            i,
            s,
            o = (n = r(858)) && n.__esModule ? n : { default: n },
            a = r(910),
            l = 0,
            u = 0;
          t.default = function (e, t, r) {
            var n = (t && r) || 0,
              c = t || new Array(16),
              d = (e = e || {}).node,
              h = e.clockseq;
            if (
              (e._v6 || (d || (d = i), null == h && (h = s)),
              null == d || null == h)
            ) {
              var g = e.random || (e.rng || o.default)();
              null == d &&
                ((d = [g[0], g[1], g[2], g[3], g[4], g[5]]),
                i || e._v6 || ((d[0] |= 1), (i = d))),
                null == h &&
                  ((h = 16383 & ((g[6] << 8) | g[7])),
                  void 0 !== s || e._v6 || (s = h));
            }
            var f = void 0 !== e.msecs ? e.msecs : Date.now(),
              p = void 0 !== e.nsecs ? e.nsecs : u + 1,
              v = f - l + (p - u) / 1e4;
            if (
              (v < 0 && void 0 === e.clockseq && (h = (h + 1) & 16383),
              (v < 0 || f > l) && void 0 === e.nsecs && (p = 0),
              p >= 1e4)
            )
              throw new Error(
                "uuid.v1(): Can't create more than 10M uuids/sec"
              );
            (l = f), (u = p), (s = h);
            var y = (1e4 * (268435455 & (f += 122192928e5)) + p) % 4294967296;
            (c[n++] = (y >>> 24) & 255),
              (c[n++] = (y >>> 16) & 255),
              (c[n++] = (y >>> 8) & 255),
              (c[n++] = 255 & y);
            var m = ((f / 4294967296) * 1e4) & 268435455;
            (c[n++] = (m >>> 8) & 255),
              (c[n++] = 255 & m),
              (c[n++] = ((m >>> 24) & 15) | 16),
              (c[n++] = (m >>> 16) & 255),
              (c[n++] = (h >>> 8) | 128),
              (c[n++] = 255 & h);
            for (var b = 0; b < 6; ++b) c[n + b] = d[b];
            return t || (0, a.unsafeStringify)(c);
          };
        },
        343: (e, t, r) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.default = function (e) {
              var t,
                r =
                  ((t = "string" == typeof e ? (0, i.default)(e) : e),
                  Uint8Array.of(
                    ((15 & t[6]) << 4) | ((t[7] >> 4) & 15),
                    ((15 & t[7]) << 4) | ((240 & t[4]) >> 4),
                    ((15 & t[4]) << 4) | ((240 & t[5]) >> 4),
                    ((15 & t[5]) << 4) | ((240 & t[0]) >> 4),
                    ((15 & t[0]) << 4) | ((240 & t[1]) >> 4),
                    ((15 & t[1]) << 4) | ((240 & t[2]) >> 4),
                    96 | (15 & t[2]),
                    t[3],
                    t[8],
                    t[9],
                    t[10],
                    t[11],
                    t[12],
                    t[13],
                    t[14],
                    t[15]
                  ));
              return "string" == typeof e ? (0, s.unsafeStringify)(r) : r;
            });
          var n,
            i = (n = r(792)) && n.__esModule ? n : { default: n },
            s = r(910);
        },
        948: (e, t, r) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.default = void 0);
          var n = s(r(25)),
            i = s(r(311));
          function s(e) {
            return e && e.__esModule ? e : { default: e };
          }
          var o = (0, n.default)("v3", 48, i.default);
          t.default = o;
        },
        25: (e, t, r) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.URL = t.DNS = void 0),
            (t.default = function (e, t, r) {
              function n(e, n, o, a) {
                var l;
                if (
                  ("string" == typeof e &&
                    (e = (function (e) {
                      e = unescape(encodeURIComponent(e));
                      for (var t = [], r = 0; r < e.length; ++r)
                        t.push(e.charCodeAt(r));
                      return t;
                    })(e)),
                  "string" == typeof n && (n = (0, s.default)(n)),
                  16 !== (null === (l = n) || void 0 === l ? void 0 : l.length))
                )
                  throw TypeError(
                    "Namespace must be array-like (16 iterable integer values, 0-255)"
                  );
                var u = new Uint8Array(16 + e.length);
                if (
                  (u.set(n),
                  u.set(e, n.length),
                  ((u = r(u))[6] = (15 & u[6]) | t),
                  (u[8] = (63 & u[8]) | 128),
                  o)
                ) {
                  a = a || 0;
                  for (var c = 0; c < 16; ++c) o[a + c] = u[c];
                  return o;
                }
                return (0, i.unsafeStringify)(u);
              }
              try {
                n.name = e;
              } catch (e) {}
              return (n.DNS = o), (n.URL = a), n;
            });
          var n,
            i = r(910),
            s = (n = r(792)) && n.__esModule ? n : { default: n },
            o = (t.DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8"),
            a = (t.URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8");
        },
        73: (e, t, r) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.default = void 0);
          var n = o(r(140)),
            i = o(r(858)),
            s = r(910);
          function o(e) {
            return e && e.__esModule ? e : { default: e };
          }
          t.default = function (e, t, r) {
            if (n.default.randomUUID && !t && !e) return n.default.randomUUID();
            var o = (e = e || {}).random || (e.rng || i.default)();
            if (((o[6] = (15 & o[6]) | 64), (o[8] = (63 & o[8]) | 128), t)) {
              r = r || 0;
              for (var a = 0; a < 16; ++a) t[r + a] = o[a];
              return t;
            }
            return (0, s.unsafeStringify)(o);
          };
        },
        186: (e, t, r) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.default = void 0);
          var n = s(r(25)),
            i = s(r(42));
          function s(e) {
            return e && e.__esModule ? e : { default: e };
          }
          var o = (0, n.default)("v5", 80, i.default);
          t.default = o;
        },
        671: (e, t, r) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.default = function (e = {}, t, r = 0) {
              var o = (0, i.default)(
                l(l({}, e), {}, { _v6: !0 }),
                new Uint8Array(16)
              );
              if (((o = (0, s.default)(o)), t)) {
                for (var a = 0; a < 16; a++) t[r + a] = o[a];
                return t;
              }
              return (0, n.unsafeStringify)(o);
            });
          var n = r(910),
            i = o(r(518)),
            s = o(r(343));
          function o(e) {
            return e && e.__esModule ? e : { default: e };
          }
          function a(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
              var n = Object.getOwnPropertySymbols(e);
              t &&
                (n = n.filter(function (t) {
                  return Object.getOwnPropertyDescriptor(e, t).enumerable;
                })),
                r.push.apply(r, n);
            }
            return r;
          }
          function l(e) {
            for (var t = 1; t < arguments.length; t++) {
              var r = null != arguments[t] ? arguments[t] : {};
              t % 2
                ? a(Object(r), !0).forEach(function (t) {
                    u(e, t, r[t]);
                  })
                : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(r)
                  )
                : a(Object(r)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(r, t)
                    );
                  });
            }
            return e;
          }
          function u(e, t, r) {
            return (
              (t = (function (e) {
                var t = (function (e, t) {
                  if ("object" != typeof e || !e) return e;
                  var r = e[Symbol.toPrimitive];
                  if (void 0 !== r) {
                    var n = r.call(e, "string");
                    if ("object" != typeof n) return n;
                    throw new TypeError(
                      "@@toPrimitive must return a primitive value."
                    );
                  }
                  return String(e);
                })(e);
                return "symbol" == typeof t ? t : t + "";
              })(t)) in e
                ? Object.defineProperty(e, t, {
                    value: r,
                    enumerable: !0,
                    configurable: !0,
                    writable: !0,
                  })
                : (e[t] = r),
              e
            );
          }
        },
        507: (e, t, r) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.default = function (e) {
              var t,
                r =
                  ((t = "string" == typeof e ? (0, i.default)(e) : e),
                  Uint8Array.of(
                    ((15 & t[3]) << 4) | ((t[4] >> 4) & 15),
                    ((15 & t[4]) << 4) | ((240 & t[5]) >> 4),
                    ((15 & t[5]) << 4) | (15 & t[6]),
                    t[7],
                    ((15 & t[1]) << 4) | ((240 & t[2]) >> 4),
                    ((15 & t[2]) << 4) | ((240 & t[3]) >> 4),
                    16 | ((240 & t[0]) >> 4),
                    ((15 & t[0]) << 4) | ((240 & t[1]) >> 4),
                    t[8],
                    t[9],
                    t[10],
                    t[11],
                    t[12],
                    t[13],
                    t[14],
                    t[15]
                  ));
              return "string" == typeof e ? (0, s.unsafeStringify)(r) : r;
            });
          var n,
            i = (n = r(792)) && n.__esModule ? n : { default: n },
            s = r(910);
        },
        744: (e, t, r) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.default = void 0);
          var n,
            i = (n = r(858)) && n.__esModule ? n : { default: n },
            s = r(910),
            o = null,
            a = null,
            l = 0;
          t.default = function (e, t, r) {
            e = e || {};
            var n = (t && r) || 0,
              u = t || new Uint8Array(16),
              c = e.random || (e.rng || i.default)(),
              d = void 0 !== e.msecs ? e.msecs : Date.now(),
              h = void 0 !== e.seq ? e.seq : null,
              g = a,
              f = o;
            return (
              d > l &&
                void 0 === e.msecs &&
                ((l = d), null !== h && ((g = null), (f = null))),
              null !== h &&
                (h > 2147483647 && (h = 2147483647),
                (g = (h >>> 19) & 4095),
                (f = 524287 & h)),
              (null !== g && null !== f) ||
                ((g = ((g = 127 & c[6]) << 8) | c[7]),
                (f =
                  ((f = ((f = 63 & c[8]) << 8) | c[9]) << 5) | (c[10] >>> 3))),
              d + 1e4 > l && null === h
                ? ++f > 524287 && ((f = 0), ++g > 4095 && ((g = 0), l++))
                : (l = d),
              (a = g),
              (o = f),
              (u[n++] = (l / 1099511627776) & 255),
              (u[n++] = (l / 4294967296) & 255),
              (u[n++] = (l / 16777216) & 255),
              (u[n++] = (l / 65536) & 255),
              (u[n++] = (l / 256) & 255),
              (u[n++] = 255 & l),
              (u[n++] = ((g >>> 4) & 15) | 112),
              (u[n++] = 255 & g),
              (u[n++] = ((f >>> 13) & 63) | 128),
              (u[n++] = (f >>> 5) & 255),
              (u[n++] = ((f << 3) & 255) | (7 & c[10])),
              (u[n++] = c[11]),
              (u[n++] = c[12]),
              (u[n++] = c[13]),
              (u[n++] = c[14]),
              (u[n++] = c[15]),
              t || (0, s.unsafeStringify)(u)
            );
          };
        },
        37: (e, t, r) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.default = void 0);
          var n,
            i = (n = r(656)) && n.__esModule ? n : { default: n };
          t.default = function (e) {
            return "string" == typeof e && i.default.test(e);
          };
        },
        775: (e, t, r) => {
          "use strict";
          Object.defineProperty(t, "__esModule", { value: !0 }),
            (t.default = void 0);
          var n,
            i = (n = r(37)) && n.__esModule ? n : { default: n };
          t.default = function (e) {
            if (!(0, i.default)(e)) throw TypeError("Invalid UUID");
            return parseInt(e.slice(14, 15), 16);
          };
        },
      },
      t = {};
    function r(n) {
      var i = t[n];
      if (void 0 !== i) return i.exports;
      var s = (t[n] = { exports: {} });
      return e[n].call(s.exports, s, s.exports, r), s.exports;
    }
    (r.d = (e, t) => {
      for (var n in t)
        r.o(t, n) &&
          !r.o(e, n) &&
          Object.defineProperty(e, n, { enumerable: !0, get: t[n] });
    }),
      (r.g = (function () {
        if ("object" == typeof globalThis) return globalThis;
        try {
          return this || new Function("return this")();
        } catch (e) {
          if ("object" == typeof window) return window;
        }
      })()),
      (r.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
      (r.r = (e) => {
        "undefined" != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
          Object.defineProperty(e, "__esModule", { value: !0 });
      });
    var n = {};
    return (
      (() => {
        "use strict";
        var e = n;
        Object.defineProperty(e, "__esModule", { value: !0 }),
          (e.Analytics = void 0);
        var t = r(396);
        Object.defineProperty(e, "Analytics", {
          enumerable: !0,
          get: function () {
            return t.Analytics;
          },
        });
      })(),
      n
    );
  })()
);
