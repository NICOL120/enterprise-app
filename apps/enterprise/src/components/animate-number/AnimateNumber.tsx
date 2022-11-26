import big, { Big, BigSource } from 'big.js';
import { easeCircleOut } from 'd3-ease';
import { timer } from 'd3-timer';
import { DetailedHTMLProps, HTMLAttributes, useCallback, useEffect, useMemo, useRef } from 'react';
import { easeLinear } from 'd3-ease';
import classNames from 'classnames';
import styles from './AnimateNumber.module.sass';

type Formatter<T extends BigSource> = (value: T) => string;

interface Options {
  /** start value */
  from: BigSource;

  /** end value */
  to: BigSource;

  /** ease function (e.g. import { easeQuadInOut } from 'd3-ease') */
  ease?: (nomalizedTime: number) => number;
}

const interpolateBig = ({ from, to, ease = easeLinear }: Options): ((e: number) => Big) => {
  const gap = big(to).minus(from);

  return (elapsed: number) => {
    return big(from).plus(gap.mul(ease(elapsed)));
  };
};

export interface AnimateNumberProps<T extends BigSource>
  extends Omit<DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, 'children'> {
  children: T;
  initialValue?: Big;
  format: Formatter<T>;
  ease?: (nomalizedTime: number) => number;
  duration?: number;
  id?: string;
  decimalPointsFontSize?: `${number}em` | `${number}px`;
}

const defaultInitialValue = big(0);

export function AnimateNumber<T extends BigSource>({
  children,
  format,
  initialValue = defaultInitialValue,
  ease = easeCircleOut,
  duration = 400,
  id,
  decimalPointsFontSize,
  className,
  ...spanProps
}: AnimateNumberProps<T>) {
  const _mainElement = useRef<HTMLSpanElement>(null);
  const _subElement = useRef<HTMLElement>(null);
  const _format = useRef<Formatter<T>>(format);
  const _value = useRef<Big>(initialValue);
  const _ease = useRef(ease);
  const _duration = useRef(duration);

  const value = useMemo<T>(() => big(children).toFixed() as T, [children]);

  const updateValues = useCallback(
    (num: BigSource) => {
      if (_mainElement.current) {
        const str = _format.current(num as T);

        if (decimalPointsFontSize) {
          const [integer, decimal] = str.split('.');
          _mainElement.current.textContent = integer;

          if (_subElement.current && decimal) {
            _subElement.current.textContent = decimal;
          }
        } else {
          _mainElement.current.textContent = str;
        }
      }
    },
    [decimalPointsFontSize]
  );

  useEffect(() => {
    _format.current = format;
    updateValues(_value.current);
  }, [format, updateValues]);

  useEffect(() => {
    _ease.current = ease;
  }, [ease]);

  useEffect(() => {
    _duration.current = duration;
  }, [duration]);

  useEffect(() => {
    if (!_mainElement.current) return;

    const interpolate = interpolateBig({
      from: _value.current,
      to: value,
      ease: _ease.current,
    });

    const ti = timer((elapsed) => {
      const dv = interpolate(Math.min(elapsed / _duration.current, 1));
      updateValues(dv);
      if (elapsed > _duration.current) {
        ti.stop();
        updateValues(value);
      }
    });

    _value.current = big(value);

    return () => {
      ti.stop();
    };
  }, [updateValues, value]);

  return (
    <span {...spanProps}>
      <span ref={_mainElement} />
      <sub ref={_subElement} className={classNames(styles.sub, className)} />
    </span>
  );
}
