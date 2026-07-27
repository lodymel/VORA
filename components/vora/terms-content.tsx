import type { VoraLocale } from './locale'

export const TERMS_UPDATED = '2026-07-28'

export function termsUpdated(locale: VoraLocale) {
  return locale === 'ko' ? `시행일: ${TERMS_UPDATED}` : 'Effective: July 28, 2026'
}

export function termsLede(locale: VoraLocale) {
  return locale === 'ko'
    ? '이 이용약관은 LODY STUDIO가 제공하는 VORA의 이용 조건과 이용자 및 회사의 권리·의무를 정합니다.'
    : 'These Terms govern VORA, provided by LODY STUDIO, and explain your and our rights and responsibilities.'
}

function Chapter({
  index,
  title,
  children,
}: {
  index: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="vora-legal-chapter">
      <header className="vora-legal-chapter-head">
        <span className="vora-legal-chapter-index" aria-hidden="true">
          {index}
        </span>
        <h2 className="vora-legal-chapter-title">{title}</h2>
      </header>
      <div className="vora-legal-chapter-body">{children}</div>
    </section>
  )
}

export function TermsChapters({
  locale = 'en',
  whisperClassName,
}: {
  locale?: VoraLocale
  whisperClassName?: string
}) {
  if (locale === 'ko') {
    return (
      <>
        <Chapter index="01" title="서비스와 약관의 적용">
          <p>
            VORA는 이용자가 짧은 문장을 “Light”로 기록하고 개인 하늘에서 바라볼 수 있는 자기성찰
            앱입니다. 이용자가 VORA를 사용하면 이 약관에 동의한 것으로 봅니다. VORA는 의료행위,
            심리치료·상담 또는 응급 서비스를 제공하지 않습니다.
          </p>
        </Chapter>
        <Chapter index="02" title="이용자의 콘텐츠">
          <p>
            이용자가 작성한 문장의 권리는 이용자에게 남습니다. 이용자는 자신이 작성·저장·공유하는
            콘텐츠와 외부 공유 결과에 책임을 집니다. 불법, 타인에게 해를 주거나 권리를 침해하는
            콘텐츠, 또는 이용 권한이 없는 콘텐츠를 저장·공유하는 데 VORA를 이용해서는 안 됩니다.
          </p>
        </Chapter>
        <Chapter index="03" title="서비스 이용권과 금지행위">
          <p>
            회사는 이 약관에 따라 VORA를 개인적·비독점적·양도 불가능한 범위에서 사용할 권리를
            부여합니다. 관계 법령이 허용하는 경우를 제외하고 앱, 소프트웨어 또는 브랜드 자산을
            복제·역설계·재판매하거나 서비스 운영을 방해해서는 안 됩니다.
          </p>
        </Chapter>
        <Chapter index="04" title="유료 서비스와 구독">
          <p>
            현재 핵심 기능은 구매 없이 사용할 수 있습니다. 향후 VORA+가 제공되면 가격, 구독 기간,
            무료 체험 여부, 자동 갱신 및 해지 조건을 구매 확정 전에 해당 앱 스토어 화면에
            표시합니다.
          </p>
          <ul className="vora-legal-list">
            <li>구독은 스토어 계정 설정에서 해지하지 않으면 표시된 조건에 따라 갱신될 수 있습니다.</li>
            <li>무료 체험이 제공되면 종료 전 해지하지 않는 경우 유료 구독으로 전환될 수 있습니다.</li>
            <li>결제 취소·환불은 관계 법령과 해당 앱 스토어 정책에 따릅니다.</li>
          </ul>
          <p>
            디지털 콘텐츠가 즉시 제공되는 경우에도 관계 법령상 청약철회 또는 환불 권리가 인정되는
            범위는 제한되지 않습니다.
          </p>
        </Chapter>
        <Chapter index="05" title="데이터와 서비스 변경">
          <p>
            현재 Lights는 이용자 기기에 저장됩니다. 클라우드 동기화가 제공되기 전에 저장공간을
            지우거나 기기를 변경·초기화하거나 앱을 제거하면 데이터가 사라질 수 있고 회사가 복구할
            수 없습니다. 회사는 안정적인 서비스를 위해 노력하지만 점검, 장애, 운영 또는 법적
            필요에 따라 기능을 변경하거나 일시 중단할 수 있습니다.
          </p>
        </Chapter>
        <Chapter index="06" title="책임의 범위">
          <p>
            회사는 고의 또는 과실로 이용자에게 발생한 손해에 대해 관계 법령에 따라 책임을 집니다.
            이 약관의 어떤 내용도 소비자보호법령에 따라 배제할 수 없는 회사의 책임이나 이용자의
            권리를 제한하지 않습니다. 이용자의 기기 관리, 이용자가 선택한 외부 공유, 천재지변 등
            회사가 합리적으로 통제할 수 없는 사유로 발생한 손해는 관계 법령이 허용하는 범위에서
            책임이 제한될 수 있습니다.
          </p>
        </Chapter>
        <Chapter index="07" title="북미 지역 이용자">
          <p>
            미국·캐나다의 소비자보호법이 적용되는 이용자에게는 해당 지역 법령의 강행규정이
            우선합니다. 이 약관은 과실, 제품책임, 개인정보 침해, 법정 보증, 환불·청약철회 또는
            그 밖에 법률상 포기할 수 없는 권리를 배제하지 않습니다. 회사는 현재 강제 중재나
            집단소송 포기 조항을 요구하지 않습니다.
          </p>
        </Chapter>

        <Chapter index="08" title="약관 변경과 분쟁">
          <p>
            회사는 관계 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 시행일과 변경
            사유를 시행 전에 앱 또는 공개 페이지에 알립니다. 이용자에게 불리한 중대한 변경에는
            충분한 사전 고지와 필요한 동의 절차를 적용합니다. 분쟁에는 대한민국 법령이 적용되며,
            관할은 민사소송법 등 관계 법령에 따릅니다.
          </p>
          <p className={whisperClassName ?? 'vora-legal-whisper'}>
            약관·서비스 문의: VORA 공식 앱스토어 등록정보의 개발자 연락처
          </p>
        </Chapter>
      </>
    )
  }

  return (
    <>
      <Chapter index="01" title="Service and acceptance">
        <p>
          VORA is a reflection app where you can write a sentence as a “Light” in a personal sky.
          By using VORA, you agree to these Terms. VORA does not provide medical care, therapy,
          counseling, or emergency services.
        </p>
      </Chapter>
      <Chapter index="02" title="Your content">
        <p>
          You keep ownership of what you write. You are responsible for content you store or share
          and for sharing it outside VORA. Do not use VORA for unlawful, harmful, infringing content
          or content you have no right to use.
        </p>
      </Chapter>
      <Chapter index="03" title="License and prohibited conduct">
        <p>
          We grant you a personal, non-exclusive, non-transferable right to use VORA under these
          Terms. Except where law permits, you may not copy, reverse engineer, resell, misuse, or
          interfere with the app, software, or brand assets.
        </p>
      </Chapter>
      <Chapter index="04" title="Paid services and subscriptions">
        <p>
          The current core experience requires no purchase. If VORA+ is offered later, the store
          purchase flow will show the price, term, trial, renewal, and cancellation conditions
          before confirmation. Cancellation and refunds follow applicable law and store policies;
          nothing here limits a non-waivable statutory cancellation or refund right.
        </p>
      </Chapter>
      <Chapter index="05" title="Data and service changes">
        <p>
          Lights currently stay on your device. Clearing storage, changing or resetting devices, or
          uninstalling before cloud sync exists may permanently remove them. We work to keep VORA
          reliable, but may change or temporarily suspend features for maintenance, operational,
          security, or legal reasons.
        </p>
      </Chapter>
      <Chapter index="06" title="Responsibility">
        <p>
          We are responsible for loss caused by our intent or negligence as applicable law
          requires. Nothing in these Terms excludes liability or consumer rights that cannot
          lawfully be excluded. Liability for circumstances outside our reasonable control may be
          limited only to the extent applicable law permits.
        </p>
      </Chapter>

      <Chapter index="07" title="North American consumers">
        <p>
          If you live in the United States or Canada, mandatory consumer-protection laws in your
          province, territory, or state continue to apply. These Terms do not disclaim liability for
          negligence, product liability, privacy violations, statutory warranties, refunds,
          cancellation rights, or other rights that cannot legally be waived. We do not require
          mandatory arbitration or a class-action waiver in these Terms.
        </p>
        <p>
          Mobile-platform terms may also apply to downloads, billing, cancellations, and refunds.
          The platform provider is not responsible for VORA except to the extent its own terms or
          applicable law expressly provide.
        </p>
      </Chapter>

      <Chapter index="08" title="Changes, governing law, and contact">
        <p>
          We will give advance notice of revised Terms and apply consent procedures where required.
          These Terms are governed by the laws of the Republic of Korea, without depriving you of
          mandatory protections or access to courts available under the laws where you live.
          Disputes may be brought in any court that has jurisdiction under applicable law.
        </p>
        <p className={whisperClassName ?? 'vora-legal-whisper'}>
          Terms and service contact: the developer contact published on VORA’s official app-store
          listing
        </p>
      </Chapter>
    </>
  )
}
